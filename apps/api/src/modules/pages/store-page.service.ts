import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { StorePageModel } from "./store-page.model.js";
import { PageVersionModel } from "./page-version.model.js";
import { PageHistoryModel } from "./page-history.model.js";
import { StoreModel } from "../../models/store.model.js";
import { checkLimit } from "../features/feature-access.service.js";

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

// ─── Ensure home page exists ─────────────────────────────────────────────────

export async function ensureHomePage(storeId: string) {
  await connectDatabase();
  const home = await StorePageModel.findOne({ storeId, isHomePage: true, deletedAt: null });
  if (home) return home;

  const existing = await StorePageModel.findOne({ storeId, slug: "/", deletedAt: null });
  if (existing) {
    await StorePageModel.updateOne({ _id: existing._id }, { $set: { isHomePage: true } });
    return existing;
  }

  return StorePageModel.create({
    storeId,
    title: "Home",
    slug: "/",
    isHomePage: true,
    status: "published",
    sortOrder: 0,
    settings: { layoutWidth: "1200px" },
  });
}

// ─── List pages with tree ────────────────────────────────────────────────────

export async function listStorePages(storeId: string) {
  await connectDatabase();
  await ensureHomePage(storeId);

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

export async function getStorePageBySlug(storeId: string, slug: string) {
  await connectDatabase();
  const page = await StorePageModel.findOne({ storeId, slug, deletedAt: null }).lean();
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
  storeId: string,
  payload: {
    title: string;
    slug: string;
    description?: string;
    parentId?: string;
    authorId?: string;
    isFolder?: boolean;
  }
) {
  await connectDatabase();

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
    authorId: payload.authorId,
    parentId: payload.parentId ?? null,
    isFolder: payload.isFolder ?? false,
    status: "draft",
    sortOrder: count,
    sections: [],
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
  storeId: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const existing = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!existing) return { ok: false as const, message: "Page not found" };

  if (existing.isHomePage && payload.slug && payload.slug !== "/") {
    return { ok: false as const, message: "Home page slug cannot be changed" };
  }

  const update: Record<string, unknown> = {};

  if (payload.title !== undefined) update.title = payload.title;
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.slug !== undefined && !existing.isHomePage) {
    update.slug = await generateUniqueSlug(storeId, String(payload.slug));
  }
  if (payload.pageIcon !== undefined) update.pageIcon = payload.pageIcon;
  if (payload.featuredImage !== undefined) update.featuredImage = payload.featuredImage;
  if (payload.visibility !== undefined) update.visibility = payload.visibility;
  if (payload.sortOrder !== undefined) update.sortOrder = payload.sortOrder;
  if (payload.parentId !== undefined) update.parentId = payload.parentId === "" ? null : payload.parentId;
  if (payload.sections !== undefined) update.sections = payload.sections;
  if (payload.html !== undefined) update.html = payload.html;
  if (payload.seo !== undefined) update.seo = payload.seo;
  if (payload.settings !== undefined) update.settings = payload.settings;
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
    html: original.html ?? "",
    theme: original.theme,
    seo: original.seo,
    settings: { ...original.settings, password: "" },
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
  storeId: string,
  payload: {
    sections?: unknown[];
    theme?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    html?: string;
  }
) {
  await connectDatabase();
  const existing = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!existing) return { ok: false as const, message: "Page not found" };

  const update: Record<string, unknown> = {};
  if (payload.sections !== undefined) update.sections = payload.sections;
  if (payload.theme !== undefined) update.theme = payload.theme;
  if (payload.settings !== undefined) update.settings = payload.settings;
  if (payload.html !== undefined) update.html = payload.html;
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
        theme: version.theme,
        seo: version.seo,
        settings: version.settings,
        html: version.html ?? "",
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
