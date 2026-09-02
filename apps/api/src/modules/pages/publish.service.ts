import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { StorePageModel } from "./store-page.model.js";
import { PageVersionModel } from "./page-version.model.js";
import { PageHistoryModel } from "./page-history.model.js";
import { StoreModel } from "../../models/store.model.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PublishDiff = {
  addedSections: number;
  removedSections: number;
  modifiedSections: number;
  headerChanged: boolean;
  footerChanged: boolean;
  themeChanged: boolean;
  seoChanged: boolean;
  settingsChanged: boolean;
  summary: string;
};

type PublishResult = {
  ok: boolean;
  message?: string;
  data?: {
    page: Record<string, unknown>;
    version: number;
    diff: PublishDiff;
  };
};

function computeDiff(before: Record<string, unknown>, after: Record<string, unknown>): PublishDiff {
  const beforeSections = (before.sections as unknown[]) || [];
  const afterSections = (after.sections as unknown[]) || [];

  const beforeIds = new Set(beforeSections.map((s: any) => s.id));
  const afterIds = new Set(afterSections.map((s: any) => s.id));

  const addedSections = afterSections.filter((s: any) => !beforeIds.has(s.id)).length;
  const removedSections = beforeSections.filter((s: any) => !afterIds.has(s.id)).length;
  const modifiedSections = afterSections.filter((s: any) => beforeIds.has(s.id) && beforeSections.find((b: any) => b.id === s.id && JSON.stringify(b.props) !== JSON.stringify(s.props))).length;

  return {
    addedSections,
    removedSections,
    modifiedSections,
    headerChanged: JSON.stringify(before.headerSections) !== JSON.stringify(after.headerSections),
    footerChanged: JSON.stringify(before.footerSections) !== JSON.stringify(after.footerSections),
    themeChanged: JSON.stringify(before.theme) !== JSON.stringify(after.theme),
    seoChanged: JSON.stringify(before.seo) !== JSON.stringify(after.seo),
    settingsChanged: JSON.stringify(before.settings) !== JSON.stringify(after.settings),
    summary: [
      addedSections ? `+${addedSections} sections` : "",
      removedSections ? `-${removedSections} sections` : "",
      modifiedSections ? `~${modifiedSections} sections` : "",
    ].filter(Boolean).join(", ") || "No section changes",
  };
}

async function triggerRevalidation(tenantSlug: string, pageSlug: string): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  if (!secret) return;

  try {
    await fetch(`${appUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tenantSlug, scope: "page", pageSlug }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("[publish] Revalidation request failed:", (err as Error).message);
  }
}

// ─── Publish page with version snapshot + diff + cache invalidation ─────────

export async function publishPage(
  pageId: string,
  storeId: string,
  userId?: string,
): Promise<PublishResult> {
  await connectDatabase();

  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false, message: "Page not found" };
  if (page.status === "archived") return { ok: false, message: "Cannot publish an archived page" };

  const store = await StoreModel.findById(storeId).select("slug tenantId").lean();
  if (!store) return { ok: false, message: "Store not found" };

  // Get last published version for diff
  const lastPublished = await PageVersionModel.findOne({ pageId, storeId, status: "published" })
    .sort({ version: -1 })
    .lean() as Record<string, unknown> | null;

  const beforeState: Record<string, unknown> = lastPublished
    ? {
        sections: lastPublished.sections || [],
        headerSections: lastPublished.headerSections || [],
        footerSections: lastPublished.footerSections || [],
        theme: lastPublished.theme || {},
        seo: lastPublished.seo || {},
        settings: lastPublished.settings || {},
      }
    : { sections: [], headerSections: [], footerSections: [], theme: {}, seo: {}, settings: {} };

  const afterState: Record<string, unknown> = {
    sections: page.sections,
    headerSections: page.headerSections,
    footerSections: page.footerSections,
    theme: page.theme,
    seo: page.seo,
    settings: page.settings,
  };

  const diff = computeDiff(beforeState, afterState);

  // Create version snapshot
  const versionCount = await PageVersionModel.countDocuments({ pageId, storeId });
  const version = await PageVersionModel.create({
    pageId,
    storeId,
    version: versionCount + 1,
    title: page.title,
    slug: page.slug,
    sections: page.sections,
    html: page.html,
    theme: page.theme,
    seo: page.seo,
    settings: page.settings,
    status: "published",
    createdBy: userId,
    note: `Published — ${diff.summary}`,
    snapshot: {
      sections: JSON.parse(JSON.stringify(page.sections)),
      headerSections: JSON.parse(JSON.stringify(page.headerSections)),
      footerSections: JSON.parse(JSON.stringify(page.footerSections)),
      headerSettings: page.headerSettings,
      footerSettings: page.footerSettings,
    },
  });

  // Update page status
  page.status = "published";
  page.publishedAt = new Date();
  page.scheduledAt = undefined;
  await page.save();

  if (page.isHomePage || page.slug === "/") {
    await StoreModel.updateOne(
      { _id: storeId },
      {
        $set: {
          headerSettings: page.headerSettings,
          footerSettings: page.footerSettings,
        },
      }
    );
  }

  await PageHistoryModel.create({
    storeId,
    pageId,
    userId,
    action: "published",
    title: page.title,
    slug: page.slug,
    metadata: { version: version.version, diff },
  });

  // Asynchronously invalidate CDN & ISR cache
  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(storeId, page.isHomePage || page.slug === "/" ? "home" : "cms", {
    cmsSlugs: [page.slug],
  }).catch(() => {});

  return {
    ok: true,
    data: {
      page: page.toObject() as unknown as Record<string, unknown>,
      version: version.version,
      diff,
    },
  };
}

// ─── Unpublish page ─────────────────────────────────────────────────────────

export async function unpublishPage(
  pageId: string,
  storeId: string,
  userId?: string,
) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false, message: "Page not found" };

  page.status = "draft";
  await page.save();

  await PageHistoryModel.create({
    storeId,
    pageId,
    userId,
    action: "unpublished",
    title: page.title,
    slug: page.slug,
  });

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(storeId, "all").catch(() => {});

  return { ok: true, data: { page: page.toObject() } };
}

// ─── Get publish history for a page ────────────────────────────────────────

export async function getPublishHistory(pageId: string, storeId: string) {
  await connectDatabase();
  const versions = await PageVersionModel.find({ pageId, storeId, status: "published" })
    .sort({ version: -1 })
    .limit(20)
    .select("version title note createdAt createdBy status")
    .lean();

  return { ok: true, data: { versions } };
}

// ─── Rollback to a specific version ────────────────────────────────────────

export async function rollbackToVersion(
  pageId: string,
  storeId: string,
  versionNumber: number,
  userId?: string,
) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false, message: "Page not found" };

  const version = await PageVersionModel.findOne({ pageId, storeId, version: versionNumber });
  if (!version) return { ok: false, message: "Version not found" };

  const snapshot = (version as any).snapshot || {};
  page.sections = snapshot.sections || [];
  page.headerSections = snapshot.headerSections || [];
  page.footerSections = snapshot.footerSections || [];
  page.headerSettings = snapshot.headerSettings || {};
  page.footerSettings = snapshot.footerSettings || {};
  page.status = "draft";
  page.publishedAt = undefined;
  await page.save();

  await PageHistoryModel.create({
    storeId,
    pageId,
    userId,
    action: "version_restored",
    title: page.title,
    slug: page.slug,
    metadata: { restoredFromVersion: versionNumber },
  });

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(storeId, "all").catch(() => {});

  return { ok: true, data: { page: page.toObject(), restoredFromVersion: versionNumber } };
}
