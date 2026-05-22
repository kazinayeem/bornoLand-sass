import { connectDatabase } from "../config/database.js";
import { PageModel } from "../models/page.model.js";
import { StoreModel } from "../models/store.model.js";

export async function getPages(storeId: string) {
  await connectDatabase();
  const pages = await PageModel.find({ storeId }).sort({ createdAt: 1 }).lean();
  return { ok: true as const, data: { pages } };
}

export async function getPage(pageId: string) {
  await connectDatabase();
  const page = await PageModel.findById(pageId).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function savePage(pageId: string, payload: { sections?: unknown[]; theme?: Record<string, unknown> }) {
  await connectDatabase();
  const update: Record<string, unknown> = {};
  if (payload.sections) update.sections = payload.sections;
  if (payload.theme) update.theme = payload.theme;

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: update }, { new: true }).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function createPage(storeId: string, payload: { title: string; slug: string }) {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await PageModel.findOne({ storeId, slug: payload.slug }).lean();
  if (existing) return { ok: false as const, message: "Page slug already exists" };

  const page = await PageModel.create({
    storeId,
    title: payload.title,
    slug: payload.slug,
    sections: [],
    theme: store.theme
  });
  return { ok: true as const, data: { page: page.toObject() } };
}

export async function deletePage(pageId: string) {
  await connectDatabase();
  const page = await PageModel.findByIdAndDelete(pageId).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, message: "Page deleted" };
}

export async function publishPage(pageId: string) {
  await connectDatabase();
  const page = await PageModel.findByIdAndUpdate(pageId, { $set: { status: "published" } }, { new: true }).lean();
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}
