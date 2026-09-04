import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { StorePageModel } from "./store-page.model.js";
import type { PageType } from "./store-page.model.js";
import { PageVersionModel } from "./page-version.model.js";
import { PageHistoryModel } from "./page-history.model.js";
import { StoreModel } from "../../models/store.model.js";
import { checkLimit } from "../features/feature-access.service.js";
import { DEFAULT_PAGES, type DefaultPageDef } from "./default-pages.js";
import { syncPageRename, syncPageDelete } from "../navigation/navigation.service.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function recordHistory(
  storeId: string,
  action: string,
  userId?: string,
  opts?: { pageId?: string; title?: string; slug?: string; metadata?: Record<string, unknown> }
) {
  await PageHistoryModel.create({
    storeId,
    pageId: opts?.pageId,
    userId,
    action,
    title: opts?.title ?? "",
    slug: opts?.slug ?? "",
    metadata: opts?.metadata ?? {},
  });

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(storeId).catch(() => {});
}

async function createVersion(
  pageId: string,
  storeId: string,
  userId: string | undefined,
  note?: string
) {
  const doc = (await StorePageModel.findById(pageId).lean()) as Record<string, unknown> | null;
  if (!doc) return null;

  if (doc.deletedAt) return null;

  const lastVersion = (await PageVersionModel.findOne({ pageId })
    .sort({ version: -1 })
    .lean()) as { version?: number } | null;

  const version = await PageVersionModel.create({
    pageId,
    storeId,
    version: (lastVersion?.version ?? 0) + 1,
    title: doc.title,
    slug: doc.slug,
    sections: doc.sections,
    html: doc.html ?? "",
    theme: doc.theme,
    seo: doc.seo,
    settings: doc.settings,
    status: doc.status,
    createdBy: userId,
    note: note ?? "",
    snapshot: { ...doc },
  });

  return version;
}

async function generateUniqueSlug(storeId: string, baseSlug: string): Promise<string> {
  const slug = baseSlug.startsWith("/") ? baseSlug : `/${baseSlug}`;

  const existing = await StorePageModel.findOne({ storeId, slug, deletedAt: null });
  if (!existing) return slug;

  let counter = 2;
  while (true) {
    const candidate = `${slug}-${counter}`;
    const dup = await StorePageModel.findOne({ storeId, slug: candidate, deletedAt: null });
    if (!dup) return candidate;
    counter++;
  }
}

function makeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const DEFAULT_INITIAL_HOME_SECTIONS = [
  {
    id: "hero-banner-1",
    type: "hero-banner",
    label: "Hero Banner",
    visible: true,
    props: {
      headline: "Welcome to Our Store",
      subheadline: "Discover amazing products and exclusive deals.",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      imageUrl: "",
      overlayColor: "rgba(15, 23, 42, 0.45)",
      textAlignment: "left",
      heroHeight: "md",
    },
  },
  {
    id: "category-grid-1",
    type: "category-grid",
    label: "Featured Categories",
    visible: true,
    props: {
      title: "Shop by Category",
      subtitle: "Browse through our collection",
      gridColumns: "4",
    },
  },
  {
    id: "featured-products-1",
    type: "featured-products",
    label: "Featured Products",
    visible: true,
    props: {
      title: "Featured Products",
      subtitle: "Our best selling items",
      gridColumns: "4",
      showBadges: "true",
      showRatings: "true",
    },
  },
  {
    id: "newsletter-1",
    type: "newsletter",
    label: "Newsletter",
    visible: true,
    props: {
      headline: "Stay in the Loop",
      subheadline: "Subscribe for exclusive deals and updates.",
      buttonText: "Subscribe",
      placeholderText: "Enter your email",
    },
  },
];

/** Resolves an ObjectId or a store slug (e.g. 'nayeem') to a canonical ObjectId string. */
export async function resolveCanonicalStoreId(storeIdOrSlug: string): Promise<string | null> {
  if (!storeIdOrSlug) return null;
  await connectDatabase();
  if (/^[a-f\d]{24}$/i.test(storeIdOrSlug)) {
    return storeIdOrSlug;
  }
  const store = (await StoreModel.findOne({
    $or: [
      { slug: storeIdOrSlug },
      { slug: storeIdOrSlug.toLowerCase() },
      { subdomain: storeIdOrSlug },
      { subdomain: storeIdOrSlug.toLowerCase() },
    ],
  })
    .select("_id")
    .lean()
    .exec()) as { _id?: unknown } | null;
  return store?._id ? String(store._id) : null;
}

// ─── Ensure home page exists ─────────────────────────────────────────────────

export async function ensureHomePage(storeIdOrSlug: string) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  if (!/^[a-f\d]{24}$/i.test(storeId)) return null;

  const home = await StorePageModel.findOne({ storeId, isHomePage: true, deletedAt: null });
  if (home) return home;

  const existing = await StorePageModel.findOne({ storeId, slug: "/", deletedAt: null });
  if (existing) {
    await StorePageModel.updateOne({ _id: existing._id }, { $set: { isHomePage: true, pageType: "home", isSystem: true } });
    return existing;
  }

  const store = await StoreModel.findById(storeId).select("theme tenantId").lean();

  try {
    return await StorePageModel.create({
      storeId,
      tenantId: (store as any)?.tenantId,
      title: "Home",
      slug: "/",
      isHomePage: true,
      pageType: "home",
      isSystem: true,
      status: "published",
      sortOrder: 0,
      sections: DEFAULT_INITIAL_HOME_SECTIONS,
      theme: (store as any)?.theme ?? {},
      settings: { layoutWidth: "1200px" },
    });
  } catch (error: unknown) {
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      const existingAfterRace = await StorePageModel.findOne({ storeId, slug: "/", deletedAt: null });
      if (existingAfterRace) return existingAfterRace;
    }
    throw error;
  }
}

// ─── Ensure all default system pages exist ────────────────────────────────────

export async function ensureDefaultPages(storeIdOrSlug: string) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  if (!/^[a-f\d]{24}$/i.test(storeId)) return;

  const store = await StoreModel.findById(storeId).lean();
  if (!store) return;

  const existingPages = await StorePageModel.find({ storeId, deletedAt: null })
    .select("pageType slug")
    .lean();

  const existingPageTypes = new Set(existingPages.map((p) => p.pageType));
  const existingSlugs = new Set(existingPages.map((p) => p.slug));

  const pagesToCreate: DefaultPageDef[] = [];

  for (const def of DEFAULT_PAGES) {
    if (def.isSystem && !existingPageTypes.has(def.pageType)) {
      pagesToCreate.push(def);
      existingPageTypes.add(def.pageType);
    }
  }

  if (pagesToCreate.length === 0) return;

  const maxSort = existingPages.length;

  const docs = pagesToCreate.map((def, i) => {
    let finalSlug = def.slug;
    if (existingSlugs.has(finalSlug)) {
      finalSlug = `${def.slug}-${def.pageType}`;
      if (existingSlugs.has(finalSlug)) {
        finalSlug = `${def.slug}-${Date.now()}-${i}`;
      }
    }
    existingSlugs.add(finalSlug);

    return {
      storeId,
      tenantId: (store as any).tenantId,
      title: def.title,
      slug: finalSlug,
      description: def.description,
      pageType: def.pageType,
      isSystem: def.isSystem,
      status: "draft" as const,
      sortOrder: maxSort + i,
      sections: [],
      settings: (def.settings ?? {}) as Record<string, unknown>,
    };
  });

  try {
    await StorePageModel.insertMany(docs, { ordered: false });
  } catch {
    // Ignore duplicate key collision during concurrent initialization
  }
}

// ─── List pages with tree ────────────────────────────────────────────────────

export async function listStorePages(storeIdOrSlug: string) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  if (!/^[a-f\d]{24}$/i.test(storeId)) {
    return { ok: false as const, message: "Store not found" };
  }
  await ensureHomePage(storeId);
  await ensureDefaultPages(storeId);

  const pages = await StorePageModel.find({ storeId, deletedAt: null })
    .populate("authorId", "name email")
    .populate("deletedBy", "name email")
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean();

  const tree = buildPageTree(pages as any[]);
  return { ok: true as const, data: { pages, tree } };
}

function buildPageTree(pages: Array<Record<string, unknown>>) {
  const map = new Map<string, Record<string, unknown> & { children: typeof pages }>();
  const roots: typeof pages = [];

  pages.forEach((page) => {
    map.set(String(page._id), { ...page, children: [] });
  });

  pages.forEach((page) => {
    const node = map.get(String(page._id))!;
    const parentId = page.parentId ? String(page.parentId) : null;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

// ─── Get single page ─────────────────────────────────────────────────────────

export async function getStorePage(pageId: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, deletedAt: null })
    .populate("authorId", "name email")
    .populate("deletedBy", "name email")
    .lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function getStorePageBySlug(storeIdOrSlug: string, slug: string) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  if (!/^[a-f\d]{24}$/i.test(storeId)) return { ok: false as const, message: "Store not found" };
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;
  const isHomeRequest = slug === "home" || slug === "/home" || slug === "/" || slug === "";

  const page = await StorePageModel.findOne({
    storeId,
    deletedAt: null,
    ...(isHomeRequest
      ? {
          $or: [
            { isHomePage: true },
            { pageType: "home" },
            { slug: "/" },
            { slug: "/home" },
            { slug: "home" },
          ],
        }
      : {
          $or: [{ slug: normalizedSlug }, { slug: slug }, { pageType: slug }],
        }),
  }).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function getDeletedStorePage(pageId: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, deletedAt: { $ne: null } })
    .populate("authorId", "name email")
    .populate("deletedBy", "name email")
    .lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function listDeletedStorePages(storeId: string) {
  await connectDatabase();
  const pages = await StorePageModel.find({ storeId, deletedAt: { $ne: null } })
    .populate("authorId", "name email")
    .populate("deletedBy", "name email")
    .sort({ deletedAt: -1 })
    .lean();
  return { ok: true as const, data: { pages } };
}

// ─── Create page ─────────────────────────────────────────────────────────────

export async function createStorePage(
  storeIdOrSlug: string,
  payload: {
    title: string;
    slug: string;
    description?: string;
    pageType?: PageType;
    isSystem?: boolean;
    parentId?: string;
    authorId?: string;
    isFolder?: boolean;
    sections?: unknown[];
    headerSections?: unknown[];
    footerSections?: unknown[];
    globalSectionIds?: string[];
    settings?: Record<string, unknown>;
    seo?: Record<string, unknown>;
    theme?: Record<string, unknown>;
  }
) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  if (!/^[a-f\d]{24}$/i.test(storeId)) return { ok: false as const, message: "Store not found" };

  if (!payload.isFolder) {
    const limitResult = await checkLimit(storeId, "builderPages");
    if (!limitResult.allowed) {
      return { ok: false as const, message: limitResult.message ?? "Page limit reached" };
    }
  }

  const store = await StoreModel.findById(storeId).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const slug = await generateUniqueSlug(storeId, payload.slug);

  const count = await StorePageModel.countDocuments({ storeId, deletedAt: null });

  const page = await StorePageModel.create({
    storeId,
    tenantId: (store as any).tenantId,
    title: payload.title,
    slug,
    description: payload.description ?? "",
    pageType: payload.pageType ?? "custom",
    isSystem: payload.isSystem ?? false,
    authorId: payload.authorId,
    parentId: payload.parentId ?? null,
    isFolder: payload.isFolder ?? false,
    status: "draft",
    sortOrder: count,
    sections: payload.sections ?? [],
    headerSections: payload.headerSections ?? [],
    footerSections: payload.footerSections ?? [],
    globalSectionIds: payload.globalSectionIds ?? [],
    settings: (payload.settings ?? {}) as Record<string, unknown>,
    seo: (payload.seo ?? {}) as Record<string, unknown>,
    theme: (payload.theme ?? {}) as Record<string, unknown>,
  });

  await recordHistory(storeId, "created", payload.authorId, {
    pageId: String(page._id),
    title: page.title,
    slug: page.slug,
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Update page ─────────────────────────────────────────────────────────────

export async function updateStorePage(
  pageId: string,
  storeIdOrSlug: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  const existing = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!existing) return { ok: false as const, message: "Page not found" };

  if (existing.isHomePage && payload.slug && payload.slug !== "/") {
    return { ok: false as const, message: "Home page slug cannot be changed" };
  }

  const update: Record<string, unknown> = {};

  if (payload.title !== undefined) update.title = payload.title;
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.slug !== undefined && !existing.isHomePage) {
    const oldSlug = existing.slug;
    update.slug = await generateUniqueSlug(storeId, String(payload.slug));
    if (oldSlug !== update.slug) {
      await syncPageRename(storeId, oldSlug, update.slug as string).catch((err) =>
        console.error("[nav-sync] Failed to update nav items after page rename:", err)
      );
    }
  }
  if (payload.pageIcon !== undefined) update.pageIcon = payload.pageIcon;
  if (payload.featuredImage !== undefined) update.featuredImage = payload.featuredImage;
  if (payload.visibility !== undefined) update.visibility = payload.visibility;
  if (payload.sortOrder !== undefined) update.sortOrder = payload.sortOrder;
  if (payload.parentId !== undefined) update.parentId = payload.parentId === "" ? null : payload.parentId;
  if (payload.pageType !== undefined) update.pageType = payload.pageType;
  if (payload.sections !== undefined) update.sections = payload.sections;
  if (payload.headerSections !== undefined) update.headerSections = payload.headerSections;
  if (payload.footerSections !== undefined) update.footerSections = payload.footerSections;
  if (payload.globalSectionIds !== undefined) update.globalSectionIds = payload.globalSectionIds;
  if (payload.html !== undefined) update.html = payload.html;
  if (payload.seo !== undefined) update.seo = payload.seo;
  if (payload.settings !== undefined) update.settings = payload.settings;
  if (payload.headerSettings !== undefined) update.headerSettings = payload.headerSettings;
  if (payload.footerSettings !== undefined) update.footerSettings = payload.footerSettings;
  if (payload.theme !== undefined) update.theme = payload.theme;

  const updatedPage = (await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId },
    { $set: update },
    { new: true }
  ).lean()) as Record<string, unknown> | null;

  await recordHistory(storeId, "updated", undefined, {
    pageId,
    title: updatedPage?.title as string | undefined,
    slug: updatedPage?.slug as string | undefined,
    metadata: { updatedFields: Object.keys(update) },
  });

  return { ok: true as const, data: { page: updatedPage } };
}

// ─── Soft delete page ────────────────────────────────────────────────────────

export async function softDeleteStorePage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };
  if (page.isHomePage) return { ok: false as const, message: "Home page cannot be deleted" };

  const title = page.title;
  const slug = page.slug;

  await StorePageModel.updateOne(
    { _id: pageId },
    { $set: { deletedAt: new Date(), deletedBy: userId, status: "archived" } }
  );

  await StorePageModel.updateMany(
    { storeId, parentId: pageId },
    { $set: { parentId: null } }
  );

  await syncPageDelete(storeId, slug).catch((err) =>
    console.error("[nav-sync] Failed to remove nav items after page delete:", err)
  );

  await recordHistory(storeId, "deleted", userId, {
    pageId,
    title,
    slug,
  });

  return { ok: true as const, message: "Page deleted" };
}

// ─── Restore soft-deleted page ───────────────────────────────────────────────

export async function restoreSoftDeletedPage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: { $ne: null } });
  if (!page) return { ok: false as const, message: "Page not found or not deleted" };

  const newSlug = await generateUniqueSlug(storeId, page.slug.replace(/-\d+$/, ""));

  await StorePageModel.updateOne(
    { _id: pageId },
    { $set: { deletedAt: null, deletedBy: null, status: "draft", slug: newSlug, archivedAt: null } }
  );

  await recordHistory(storeId, "restored", userId, {
    pageId,
    title: page.title,
    slug: newSlug,
  });

  const restored = await StorePageModel.findById(pageId)
    .populate("authorId", "name email")
    .lean();

  return { ok: true as const, data: { page: restored } };
}

// ─── Duplicate page ──────────────────────────────────────────────────────────

export async function duplicateStorePage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const original = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!original) return { ok: false as const, message: "Page not found" };
  if (original.isHomePage) return { ok: false as const, message: "Home page cannot be duplicated" };

  const limitResult = await checkLimit(storeId, "builderPages");
  if (!limitResult.allowed) {
    return { ok: false as const, message: limitResult.message ?? "Page limit reached" };
  }

  const newSlug = await generateUniqueSlug(storeId, original.slug);
  const newTitle = `${original.title} (Copy)`;

  const page = await StorePageModel.create({
    storeId: original.storeId,
    tenantId: original.tenantId,
    title: newTitle,
    slug: newSlug,
    description: original.description,
    pageIcon: original.pageIcon,
    featuredImage: original.featuredImage,
    status: "draft",
    visibility: original.visibility,
    sortOrder: original.sortOrder + 1,
    sections: original.sections,
    headerSections: original.headerSections ?? [],
    footerSections: original.footerSections ?? [],
    globalSectionIds: original.globalSectionIds ?? [],
    html: original.html ?? "",
    theme: original.theme,
    seo: original.seo,
    settings: { ...original.settings, password: "" },
    headerSettings: original.headerSettings ?? {},
    footerSettings: original.footerSettings ?? {},
    authorId: userId,
    parentId: original.parentId,
  });

  await recordHistory(storeId, "duplicated", userId, {
    pageId: String(page._id),
    title: page.title,
    slug: page.slug,
    metadata: { originalId: pageId, originalTitle: original.title },
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Publish page ────────────────────────────────────────────────────────────

export async function publishStorePage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };
  if (page.status === "archived") return { ok: false as const, message: "Cannot publish an archived page" };

  await createVersion(pageId, storeId, userId, "Pre-publish snapshot");

  page.status = "published";
  page.publishedAt = new Date();
  page.scheduledAt = undefined;
  await page.save();

  await recordHistory(storeId, "published", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Unpublish page ──────────────────────────────────────────────────────────

export async function unpublishStorePage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };

  page.status = "draft";
  await page.save();

  await recordHistory(storeId, "unpublished", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Schedule publish ────────────────────────────────────────────────────────

export async function scheduleStorePage(
  pageId: string,
  storeId: string,
  scheduledAt: Date,
  userId?: string
) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };

  page.status = "scheduled";
  page.scheduledAt = scheduledAt;
  await page.save();

  await recordHistory(storeId, "scheduled", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
    metadata: { scheduledAt },
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Archive page ────────────────────────────────────────────────────────────

export async function archiveStorePage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };
  if (page.isHomePage) return { ok: false as const, message: "Home page cannot be archived" };

  page.status = "archived";
  page.archivedAt = new Date();
  await page.save();

  await recordHistory(storeId, "archived", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Restore page from archive ───────────────────────────────────────────────

export async function restoreStorePage(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };
  if (page.status !== "archived") return { ok: false as const, message: "Page is not archived" };

  page.status = "draft";
  page.archivedAt = undefined;
  await page.save();

  await recordHistory(storeId, "restored", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
  });

  return { ok: true as const, data: { page: page.toObject() } };
}

// ─── Preview system ──────────────────────────────────────────────────────────

export async function generatePreviewToken(pageId: string, storeId: string, userId?: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };

  const token = makeToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await StorePageModel.updateOne(
    { _id: pageId },
    { $set: { previewToken: token, previewTokenExpiresAt: expiresAt } }
  );

  await recordHistory(storeId, "preview_token_generated", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
    metadata: { expiresAt },
  });

  return { ok: true as const, data: { token, expiresAt, previewUrl: `/api/preview/${token}` } };
}

export async function getPageByPreviewToken(token: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({
    previewToken: token,
    previewTokenExpiresAt: { $gt: new Date() },
    deletedAt: null,
  }).lean();

  if (!page) return { ok: false as const, message: "Preview link is invalid or expired" };
  return { ok: true as const, data: { page } };
}

// ─── Export / Import sections ────────────────────────────────────────────────

export async function exportPageSections(pageId: string, storeId: string) {
  await connectDatabase();
  const page = (await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null }).lean()) as Record<string, unknown> | null;
  if (!page) return { ok: false as const, message: "Page not found" };

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    sourcePage: page.title as string,
    sourceSlug: page.slug as string,
    sections: (page.sections ?? []) as unknown[],
    theme: page.theme as Record<string, unknown> | undefined,
    seo: page.seo as Record<string, unknown> | undefined,
    settings: page.settings as Record<string, unknown> | undefined,
  };

  return { ok: true as const, data: exportData };
}

export async function importPageSections(
  pageId: string,
  storeId: string,
  importData: {
    sections?: unknown[];
    theme?: Record<string, unknown>;
    settings?: Record<string, unknown>;
  },
  userId?: string
) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };

  const update: Record<string, unknown> = {};
  if (importData.sections !== undefined) update.sections = importData.sections;
  if (importData.theme !== undefined) update.theme = importData.theme;
  if (importData.settings !== undefined) update.settings = importData.settings;

  const updated = await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId },
    { $set: update },
    { new: true }
  ).lean();

  await recordHistory(storeId, "sections_imported", userId, {
    pageId,
    title: page.title,
    slug: page.slug,
    metadata: { sectionCount: (importData.sections ?? []).length },
  });

  return { ok: true as const, data: { page: updated } };
}

// ─── Save draft (builder autosave) ──────────────────────────────────────────

export async function saveStorePageDraft(
  pageId: string,
  storeIdOrSlug: string,
  payload: {
    sections?: unknown[];
    headerSections?: unknown[];
    footerSections?: unknown[];
    globalSectionIds?: string[];
    theme?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    headerSettings?: Record<string, unknown>;
    footerSettings?: Record<string, unknown>;
    html?: string;
    seo?: Record<string, unknown>;
  }
) {
  await connectDatabase();
  const storeId = (await resolveCanonicalStoreId(storeIdOrSlug)) || storeIdOrSlug;
  const existing = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!existing) return { ok: false as const, message: "Page not found" };

  const update: Record<string, unknown> = {};
  if (payload.sections !== undefined) update.sections = payload.sections;
  if (payload.headerSections !== undefined) update.headerSections = payload.headerSections;
  if (payload.footerSections !== undefined) update.footerSections = payload.footerSections;
  if (payload.globalSectionIds !== undefined) update.globalSectionIds = payload.globalSectionIds;
  if (payload.theme !== undefined) update.theme = payload.theme;
  if (payload.settings !== undefined) update.settings = payload.settings;
  if (payload.headerSettings !== undefined) update.headerSettings = payload.headerSettings;
  if (payload.footerSettings !== undefined) update.footerSettings = payload.footerSettings;
  if (payload.html !== undefined) update.html = payload.html;
  if (payload.seo !== undefined) update.seo = payload.seo;
  update.status = existing.status === "published" ? "published" : "draft";

  const page = await StorePageModel.findByIdAndUpdate(pageId, { $set: update }, { new: true }).lean();

  return { ok: true as const, data: { page } };
}

// ─── Page versions ───────────────────────────────────────────────────────────

export async function listPageVersions(pageId: string) {
  await connectDatabase();
  const versions = await PageVersionModel.find({ pageId })
    .populate("createdBy", "name email")
    .sort({ version: -1 })
    .lean();
  return { ok: true as const, data: { versions } };
}

export async function getPageVersion(versionId: string) {
  await connectDatabase();
  const version = await PageVersionModel.findById(versionId)
    .populate("createdBy", "name email")
    .lean();
  if (!version) return { ok: false as const, message: "Version not found" };
  return { ok: true as const, data: { version } };
}

export async function restorePageVersion(
  versionId: string,
  pageId: string,
  storeId: string,
  userId?: string
) {
  await connectDatabase();
  const version = await PageVersionModel.findById(versionId);
  if (!version) return { ok: false as const, message: "Version not found" };

  await createVersion(pageId, storeId, userId, "Pre-restore snapshot");

  const page = await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId },
    {
      $set: {
        sections: version.sections,
        headerSections: (version as any).headerSections ?? [],
        footerSections: (version as any).footerSections ?? [],
        globalSectionIds: (version as any).globalSectionIds ?? [],
        theme: version.theme,
        seo: version.seo,
        settings: version.settings,
        html: version.html ?? "",
        headerSettings: (version as any).headerSettings ?? {},
        footerSettings: (version as any).footerSettings ?? {},
        status: "draft",
        restoredFrom: version._id,
      },
    },
    { new: true }
  ).lean() as Record<string, unknown> | null;

  await recordHistory(storeId, "version_restored", userId, {
    pageId,
    title: page?.title as string | undefined,
    slug: page?.slug as string | undefined,
    metadata: { versionId, version: version?.version },
  });

  return { ok: true as const, data: { page } };
}

// ─── Page history ────────────────────────────────────────────────────────────

export async function listPageHistory(storeId: string, pageId?: string) {
  await connectDatabase();
  const filter: Record<string, unknown> = { storeId };
  if (pageId) filter.pageId = pageId;

  const history = await PageHistoryModel.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return { ok: true as const, data: { history } };
}

// ─── Rename page ─────────────────────────────────────────────────────────────

export async function renameStorePage(pageId: string, storeId: string, title: string, userId?: string) {
  await connectDatabase();
  const page = (await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId, deletedAt: null },
    { $set: { title } },
    { new: true }
  ).lean()) as Record<string, unknown> | null;
  if (!page) return { ok: false as const, message: "Page not found" };

  await recordHistory(storeId, "renamed", userId, {
    pageId,
    title,
    slug: page.slug as string,
  });

  return { ok: true as const, data: { page } };
}

// ─── Reorder pages ───────────────────────────────────────────────────────────

export async function reorderStorePages(
  storeId: string,
  orderedIds: string[]
) {
  await connectDatabase();
  for (let i = 0; i < orderedIds.length; i++) {
    await StorePageModel.updateOne(
      { _id: orderedIds[i], storeId },
      { $set: { sortOrder: i } }
    );
  }
  return { ok: true as const, message: "Pages reordered" };
}

// ─── Search pages ────────────────────────────────────────────────────────────

export async function searchStorePages(storeId: string, query: string) {
  await connectDatabase();
  const pages = await StorePageModel.find({
    storeId,
    deletedAt: null,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { slug: { $regex: query, $options: "i" } },
    ],
  })
    .sort({ sortOrder: 1 })
    .lean();
  return { ok: true as const, data: { pages } };
}

// ─── List pages by type ───────────────────────────────────────────────────────

export async function listPagesByType(storeId: string, pageType: PageType) {
  await connectDatabase();
  const pages = await StorePageModel.find({ storeId, pageType, deletedAt: null })
    .sort({ sortOrder: 1 })
    .lean();
  return { ok: true as const, data: { pages } };
}

// ─── Get page by type (returns only one) ──────────────────────────────────────

export async function getPageByType(storeId: string, pageType: PageType) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ storeId, pageType, deletedAt: null }).lean();
  if (!page) return { ok: false as const, message: `Page not found for type: ${pageType}` };
  return { ok: true as const, data: { page } };
}

// ─── List system pages only ───────────────────────────────────────────────────

export async function listSystemPages(storeId: string) {
  await connectDatabase();
  const pages = await StorePageModel.find({ storeId, isSystem: true, deletedAt: null })
    .sort({ sortOrder: 1 })
    .lean();
  return { ok: true as const, data: { pages } };
}

// ─── Update page header sections ─────────────────────────────────────────────

export async function updatePageHeaderSections(
  pageId: string,
  storeId: string,
  headerSections: unknown[]
) {
  await connectDatabase();
  const page = await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId, deletedAt: null },
    { $set: { headerSections } },
    { new: true }
  ).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

// ─── Update page footer sections ─────────────────────────────────────────────

export async function updatePageFooterSections(
  pageId: string,
  storeId: string,
  footerSections: unknown[]
) {
  await connectDatabase();
  const page = await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId, deletedAt: null },
    { $set: { footerSections } },
    { new: true }
  ).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

// ─── Update page header settings ─────────────────────────────────────────────

export async function updatePageHeaderSettings(
  pageId: string,
  storeId: string,
  headerSettings: Record<string, unknown>
) {
  await connectDatabase();
  const page = await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId, deletedAt: null },
    { $set: { headerSettings } },
    { new: true }
  ).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

// ─── Update page footer settings ─────────────────────────────────────────────

export async function updatePageFooterSettings(
  pageId: string,
  storeId: string,
  footerSettings: Record<string, unknown>
) {
  await connectDatabase();
  const page = await StorePageModel.findOneAndUpdate(
    { _id: pageId, storeId, deletedAt: null },
    { $set: { footerSettings } },
    { new: true }
  ).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}
