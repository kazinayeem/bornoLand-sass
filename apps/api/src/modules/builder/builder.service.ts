import { connectDatabase } from "../../common/database/connection.js";
import { PageModel } from "../../models/page.model.js";
import { StoreModel } from "../../models/store.model.js";
import { checkLimit } from "../features/feature-access.service.js";

export async function getPages(storeId: string) {
  await connectDatabase();
  const pages = await PageModel.find({ storeId }).sort({ createdAt: 1 }).lean();
  return { ok: true as const, data: { pages } };
}

export async function getPage(pageId: string) {
  await connectDatabase();
  const page = await PageModel.findById(pageId).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function savePage(
  pageId: string,
  payload: {
    storeId?: string;
    sections?: unknown[];
    theme?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  },
) {
  await connectDatabase();
  const existing = (await PageModel.findById(pageId).lean()) as { storeId?: unknown } | null;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (payload.storeId && String(existing.storeId) !== payload.storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }

  const update: Record<string, unknown> = {};
  if (payload.sections) update.sections = payload.sections;
  if (payload.theme) update.theme = payload.theme;
  if (payload.settings) update.settings = payload.settings;
  if (payload.metadata) update.metadata = payload.metadata;
  update.status = "draft";

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: update }, { new: true }).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function createPage(storeId: string, payload: { title: string; slug: string }) {
  await connectDatabase();

  const limitResult = await checkLimit(storeId, "builderPages");
  if (!limitResult.allowed) {
    return { ok: false as const, message: limitResult.message ?? "Page limit reached" };
  }

  const store = await StoreModel.findById(storeId).lean() as any;
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await PageModel.findOne({ storeId, slug: payload.slug }).lean() as any;
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
  const page = await PageModel.findByIdAndDelete(pageId).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, message: "Page deleted" };
}

export async function publishPage(pageId: string, payload?: { storeId?: string; status?: string }) {
  await connectDatabase();
  const existing = (await PageModel.findById(pageId).lean()) as { storeId?: unknown } | null;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (payload?.storeId && String(existing.storeId) !== payload.storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }

  const page = await PageModel.findByIdAndUpdate(
    pageId,
    { $set: { status: payload?.status ?? "published" } },
    { new: true },
  ).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}
