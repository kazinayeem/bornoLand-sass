import { connectDatabase } from "../config/database.js";
import { PageModel } from "../models/page.model.js";
import { StoreModel } from "../models/store.model.js";

type SectionLike = Record<string, unknown> & { id?: string; type?: string; visible?: boolean; props?: Record<string, unknown> };

function normalizeSections(sections: unknown[]): SectionLike[] {
  return sections.map((section, index) => {
    const item = (section ?? {}) as SectionLike;
    return {
      ...item,
      id: String(item.id ?? `${String(item.type ?? "section")}-${Date.now()}-${index}`),
      type: String(item.type ?? "section"),
      visible: item.visible !== false,
      props: item.props ?? {},
    };
  });
}

export async function getPages(storeId: string) {
  await connectDatabase();
  let pages = await PageModel.find({ storeId }).sort({ createdAt: 1 }).lean() as any[];
  pages = pages.map((p) => ({
    ...p,
    // expose current draft for builder editing
    sections: p.draftSections ?? p.publishedSections ?? [],
    theme: p.draftTheme ?? p.publishedTheme ?? p.theme ?? {},
    status: p.publishStatus ?? "draft",
  }));
  return { ok: true as const, data: { pages } };
}

export async function getPage(pageId: string) {
  await connectDatabase();
  const pageDoc = await PageModel.findById(pageId).lean() as any;
  const page = pageDoc
    ? {
        ...pageDoc,
        sections: pageDoc.draftSections ?? pageDoc.publishedSections ?? [],
        theme: pageDoc.draftTheme ?? pageDoc.publishedTheme ?? pageDoc.theme ?? {},
        status: pageDoc.publishStatus ?? "draft",
      }
    : null;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function savePage(pageId: string, payload: { sections?: unknown[]; theme?: Record<string, unknown> }) {
  await connectDatabase();
  const update: Record<string, unknown> = {};
  let normalizedSections: SectionLike[] | undefined;
  if (payload.sections) {
    normalizedSections = normalizeSections(payload.sections);
    update.draftSections = normalizedSections;
    console.log("[builder] savePage - sections count:", normalizedSections.length);
  }
  if (payload.theme) update.draftTheme = payload.theme;

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: update }, { new: true }).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };

  if (normalizedSections) {
    await StoreModel.updateOne(
      { _id: page.storeId },
      {
        $set: {
          homepageSections: normalizedSections,
          homepageConfig: {
            theme: payload.theme ?? page.draftTheme ?? page.publishedTheme ?? page.theme ?? {},
            updatedAt: new Date(),
          },
        },
      }
    );
  }

  return { ok: true as const, data: { page } };
}

export async function createPage(storeId: string, payload: { title: string; slug: string }) {
  await connectDatabase();
  const store = await StoreModel.findById(storeId).lean() as any;
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await PageModel.findOne({ storeId, slug: payload.slug }).lean() as any;
  if (existing) return { ok: false as const, message: "Page slug already exists" };

  const page = await PageModel.create({
    storeId,
    title: payload.title,
    slug: payload.slug,
    // initialize both draft and published to store theme
    draftSections: [],
    draftTheme: store.theme,
    publishedSections: [],
    publishedTheme: store.theme,
    publishStatus: "draft",
  });
  return { ok: true as const, data: { page: page.toObject() } };
}

export async function deletePage(pageId: string) {
  await connectDatabase();
  const page = await PageModel.findByIdAndDelete(pageId).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, message: "Page deleted" };
}

export async function publishPage(pageId: string, userId?: string) {
  await connectDatabase();
  const pageDoc = await PageModel.findById(pageId);
  if (!pageDoc) return { ok: false as const, message: "Page not found" };

  // copy draft to published atomically
  const publishedSections = normalizeSections((pageDoc.draftSections ?? []) as unknown[]);
  pageDoc.publishedSections = publishedSections;
  pageDoc.publishedTheme = pageDoc.draftTheme ?? pageDoc.publishedTheme ?? {};
  pageDoc.publishStatus = "published";
  pageDoc.publishedAt = new Date();
  if (userId) pageDoc.publishedBy = userId as any;

  await pageDoc.save();
  await StoreModel.updateOne(
    { _id: pageDoc.storeId },
    {
      $set: {
        publishedSections,
        homepageSections: publishedSections,
        homepageConfig: {
          theme: pageDoc.publishedTheme ?? pageDoc.draftTheme ?? pageDoc.theme ?? {},
          updatedAt: new Date(),
        },
      },
    }
  );
  const page = await PageModel.findById(pageId).lean() as any;
  console.log("[builder] publishPage", {
    pageId,
    storeId: String(pageDoc.storeId),
    sectionCount: publishedSections.length,
    publishedAt: page?.publishedAt ?? new Date().toISOString(),
  });
  return { ok: true as const, data: { page } };
}
