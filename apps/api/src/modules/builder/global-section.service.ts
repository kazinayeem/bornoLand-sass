import { connectDatabase } from "../../common/database/connection.js";
import { GlobalSectionModel } from "./global-section.model.js";
import { StorePageModel } from "../pages/store-page.model.js";

// ─── List global sections ────────────────────────────────────────────────────

export async function listGlobalSections(storeId: string) {
  await connectDatabase();
  const sections = await GlobalSectionModel.find({ storeId, status: { $ne: "archived" } })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();
  return { ok: true as const, data: { sections } };
}

// ─── Get single global section ───────────────────────────────────────────────

export async function getGlobalSection(sectionId: string) {
  await connectDatabase();
  const section = await GlobalSectionModel.findById(sectionId).lean();
  if (!section) return { ok: false as const, message: "Global section not found" };
  return { ok: true as const, data: { section } };
}

// ─── Create global section ───────────────────────────────────────────────────

export async function createGlobalSection(
  storeId: string,
  payload: {
    name: string;
    slug: string;
    description?: string;
    type?: string;
    category?: string;
    sections?: unknown[];
    authorId?: string;
  }
) {
  await connectDatabase();

  const count = await GlobalSectionModel.countDocuments({ storeId });

  const section = await GlobalSectionModel.create({
    storeId,
    name: payload.name,
    slug: payload.slug,
    description: payload.description ?? "",
    type: payload.type ?? "custom",
    category: payload.category ?? "custom",
    sections: payload.sections ?? [],
    status: "draft",
    sortOrder: count,
  });

  return { ok: true as const, data: { section: section.toObject() } };
}

// ─── Update global section ───────────────────────────────────────────────────

export async function updateGlobalSection(
  sectionId: string,
  storeId: string,
  payload: Record<string, unknown>
) {
  await connectDatabase();
  const existing = await GlobalSectionModel.findOne({ _id: sectionId, storeId });
  if (!existing) return { ok: false as const, message: "Global section not found" };

  const update: Record<string, unknown> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) update.description = payload.description;
  if (payload.type !== undefined) update.type = payload.type;
  if (payload.category !== undefined) update.category = payload.category;
  if (payload.sections !== undefined) update.sections = payload.sections;
  if (payload.status !== undefined) update.status = payload.status;
  if (payload.sortOrder !== undefined) update.sortOrder = payload.sortOrder;

  const section = await GlobalSectionModel.findOneAndUpdate(
    { _id: sectionId, storeId },
    { $set: update },
    { new: true }
  ).lean();

  return { ok: true as const, data: { section } };
}

// ─── Delete global section ───────────────────────────────────────────────────

export async function deleteGlobalSection(sectionId: string, storeId: string) {
  await connectDatabase();
  const section = await GlobalSectionModel.findOne({ _id: sectionId, storeId });
  if (!section) return { ok: false as const, message: "Global section not found" };

  // Remove reference from all pages
  await StorePageModel.updateMany(
    { storeId, globalSectionIds: sectionId },
    { $pull: { globalSectionIds: sectionId } }
  );

  await GlobalSectionModel.deleteOne({ _id: sectionId, storeId });
  return { ok: true as const, message: "Global section deleted" };
}

// ─── Publish global section ──────────────────────────────────────────────────

export async function publishGlobalSection(sectionId: string, storeId: string) {
  await connectDatabase();
  const section = await GlobalSectionModel.findOneAndUpdate(
    { _id: sectionId, storeId },
    { $set: { status: "published" } },
    { new: true }
  ).lean();
  if (!section) return { ok: false as const, message: "Global section not found" };
  return { ok: true as const, data: { section } };
}

// ─── Attach global section to page ───────────────────────────────────────────

export async function attachGlobalSectionToPage(
  pageId: string,
  storeId: string,
  globalSectionId: string
) {
  await connectDatabase();
  const section = await GlobalSectionModel.findOne({ _id: globalSectionId, storeId });
  if (!section) return { ok: false as const, message: "Global section not found" };

  const page = await StorePageModel.findOne({ _id: pageId, storeId, deletedAt: null });
  if (!page) return { ok: false as const, message: "Page not found" };

  const globalIds = (page.globalSectionIds ?? []) as string[];
  if (globalIds.includes(globalSectionId)) {
    return { ok: true as const, message: "Already attached" };
  }

  await StorePageModel.updateOne(
    { _id: pageId },
    { $push: { globalSectionIds: globalSectionId } }
  );

  // Update counter-reference
  await GlobalSectionModel.updateOne(
    { _id: globalSectionId },
    { $addToSet: { usedOnPages: pageId } }
  );

  return { ok: true as const, message: "Global section attached to page" };
}

// ─── Detach global section from page ─────────────────────────────────────────

export async function detachGlobalSectionFromPage(
  pageId: string,
  storeId: string,
  globalSectionId: string
) {
  await connectDatabase();

  await StorePageModel.updateOne(
    { _id: pageId, storeId },
    { $pull: { globalSectionIds: globalSectionId } }
  );

  await GlobalSectionModel.updateOne(
    { _id: globalSectionId, storeId },
    { $pull: { usedOnPages: pageId } }
  );

  return { ok: true as const, message: "Global section detached from page" };
}

// ─── Get pages using a global section ────────────────────────────────────────

export async function getPagesUsingGlobalSection(sectionId: string, storeId: string) {
  await connectDatabase();
  const section = await GlobalSectionModel.findOne({ _id: sectionId, storeId }).lean() as Record<string, unknown> | null;
  if (!section) return { ok: false as const, message: "Global section not found" };

  const usedPages = (section.usedOnPages ?? []) as string[];
  const pages = await StorePageModel.find({
    _id: { $in: usedPages },
    storeId,
    deletedAt: null,
  })
    .select("title slug pageType status")
    .lean();

  return { ok: true as const, data: { pages } };
}
