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
    headerSections?: unknown[];
    footerSections?: unknown[];
    headerSettings?: Record<string, unknown>;
    footerSettings?: Record<string, unknown>;
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
  if (payload.headerSections) update.headerSections = payload.headerSections;
  if (payload.footerSections) update.footerSections = payload.footerSections;
  if (payload.headerSettings) update.headerSettings = payload.headerSettings;
  if (payload.footerSettings) update.footerSettings = payload.footerSettings;
  if (payload.theme) update.theme = payload.theme;
  if (payload.settings) update.settings = payload.settings;
  if (payload.metadata) update.metadata = payload.metadata;
  update.status = "draft";

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: update }, { new: true }).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

const DEFAULT_TEMPLATE_SECTIONS = [
  { id: "hero-banner-1", type: "hero-banner", label: "Hero Banner", visible: true, props: { headline: "Welcome", subheadline: "Discover amazing products", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
  { id: "featured-products-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", showBadges: "true", showRatings: "true" } },
  { id: "newsletter-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe for exclusive deals.", buttonText: "Subscribe", placeholderText: "Enter your email" } },
  { id: "simple-footer-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocial: "true" } },
];

export async function getOrCreateHomePage(storeId: string) {
  await connectDatabase();
  let home = await PageModel.findOne({ storeId, isHome: true }).lean() as any;
  if (!home) {
    home = await PageModel.findOne({ storeId, slug: "home" }).lean() as any;
  }
  if (!home) {
    try {
      const store = await StoreModel.findById(storeId).lean() as any;
      home = await PageModel.create({
        storeId,
        title: "Home",
        slug: "home",
        isHome: true,
        sections: DEFAULT_TEMPLATE_SECTIONS,
        theme: store?.theme ?? {},
      });
      home = home.toObject();
    } catch (error: unknown) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        home = await PageModel.findOne({ storeId, slug: "home" }).lean() as any;
        if (!home) throw new Error("Failed to create or find home page");
      } else {
        throw error;
      }
    }
  }
  return { ok: true as const, data: { page: home } };
}

export async function createPage(storeId: string, payload: { title: string; slug: string; templateId?: string }) {
  await connectDatabase();

  const limitResult = await checkLimit(storeId, "builderPages");
  if (!limitResult.allowed) {
    return { ok: false as const, message: limitResult.message ?? "Page limit reached" };
  }

  const store = await StoreModel.findById(storeId).lean() as any;
  if (!store) return { ok: false as const, message: "Store not found" };

  const existing = await PageModel.findOne({ storeId, slug: payload.slug }).lean() as any;
  if (existing) return { ok: false as const, message: "Page slug already exists" };

  let sections: unknown[] = [];

  // If templateId is provided, load sections from the template
  if (payload.templateId) {
    const { BuilderTemplateModel } = await import("./builder-template.model.js");
    const template = await BuilderTemplateModel.findOne({ _id: payload.templateId, storeId }).lean() as any;
    if (template?.sections) {
      sections = template.sections.map((s: Record<string, unknown>) => ({
        ...s,
        id: `${s.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      }));
    }
  }

  const page = await PageModel.create({
    storeId,
    title: payload.title,
    slug: payload.slug,
    isHome: false,
    showHeader: true,
    showFooter: true,
    sections,
    theme: store.theme,
  });
  return { ok: true as const, data: { page: page.toObject() } };
}

export async function deletePage(pageId: string) {
  await connectDatabase();
  const page = await PageModel.findByIdAndDelete(pageId).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, message: "Page deleted" };
}

export async function clearPage(pageId: string, payload?: { storeId?: string }) {
  await connectDatabase();
  const existing = (await PageModel.findById(pageId).lean()) as { storeId?: unknown } | null;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (payload?.storeId && String(existing.storeId) !== payload.storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }

  const page = await PageModel.findByIdAndUpdate(
    pageId,
    {
      $set: {
        sections: [],
        headerSections: [],
        footerSections: [],
        status: "draft",
      },
    },
    { new: true },
  ).lean() as any;
  if (!page) return { ok: false as const, message: "Page not found" };
  return { ok: true as const, data: { page } };
}

export async function updatePage(pageId: string, payload: {
  storeId?: string;
  title?: string;
  slug?: string;
  seo?: { title?: string; description?: string };
  showHeader?: boolean;
  showFooter?: boolean;
  navigationVisible?: boolean;
  featuredImage?: string;
  password?: string;
  customCss?: string;
  customJs?: string;
}) {
  await connectDatabase();
  const existing = await PageModel.findById(pageId).lean() as any;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (payload.storeId && String(existing.storeId) !== payload.storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }
  if (existing.isHome && payload.slug && payload.slug !== existing.slug) {
    return { ok: false as const, message: "Cannot change home page slug" };
  }
  if (payload.slug && payload.slug !== existing.slug) {
    const dup = await PageModel.findOne({ storeId: existing.storeId, slug: payload.slug, _id: { $ne: pageId } }).lean();
    if (dup) return { ok: false as const, message: "Slug already in use" };
  }

  const update: Record<string, unknown> = {};
  if (payload.title !== undefined) update.title = payload.title;
  if (payload.slug !== undefined) update.slug = payload.slug;
  if (payload.showHeader !== undefined) update.showHeader = payload.showHeader;
  if (payload.showFooter !== undefined) update.showFooter = payload.showFooter;
  if (payload.navigationVisible !== undefined) update.navigationVisible = payload.navigationVisible;
  if (payload.featuredImage !== undefined) update.featuredImage = payload.featuredImage;
  if (payload.password !== undefined) update.password = payload.password;
  if (payload.customCss !== undefined) update.customCss = payload.customCss;
  if (payload.customJs !== undefined) update.customJs = payload.customJs;
  if (payload.seo) {
    update["seo.title"] = payload.seo.title ?? existing.seo?.title ?? "";
    update["seo.description"] = payload.seo.description ?? existing.seo?.description ?? "";
  }

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: update }, { new: true }).lean() as any;
  return { ok: true as const, data: { page } };
}

export async function duplicatePage(pageId: string, storeId: string) {
  await connectDatabase();
  const existing = await PageModel.findById(pageId).lean() as any;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (String(existing.storeId) !== storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }
  if (existing.isHome) {
    return { ok: false as const, message: "Cannot duplicate home page" };
  }

  const limitResult = await checkLimit(storeId, "builderPages");
  if (!limitResult.allowed) {
    return { ok: false as const, message: limitResult.message ?? "Page limit reached" };
  }

  let slug = `${existing.slug}-copy`;
  let counter = 2;
  while (await PageModel.findOne({ storeId, slug }).lean()) {
    slug = `${existing.slug}-copy-${counter}`;
    counter++;
  }

  const page = await PageModel.create({
    storeId,
    title: `${existing.title} (Copy)`,
    slug,
    isHome: false,
    showHeader: existing.showHeader ?? true,
    showFooter: existing.showFooter ?? true,
    sections: existing.sections ?? [],
    headerSections: existing.headerSections ?? [],
    footerSections: existing.footerSections ?? [],
    theme: existing.theme ?? {},
    seo: existing.seo ?? {},
    headerSettings: existing.headerSettings ?? {},
    footerSettings: existing.footerSettings ?? {},
  });
  return { ok: true as const, data: { page: page.toObject() } };
}

export async function renamePage(pageId: string, title: string) {
  await connectDatabase();
  const existing = await PageModel.findById(pageId).lean() as any;
  if (!existing) return { ok: false as const, message: "Page not found" };

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: { title } }, { new: true }).lean() as any;
  return { ok: true as const, data: { page } };
}

export async function archivePage(pageId: string, storeId?: string) {
  await connectDatabase();
  const existing = await PageModel.findById(pageId).lean() as any;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (storeId && String(existing.storeId) !== storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }
  if (existing.isHome) {
    return { ok: false as const, message: "Cannot archive home page" };
  }

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: { status: "archived" } }, { new: true }).lean() as any;
  return { ok: true as const, data: { page } };
}

export async function restorePage(pageId: string, storeId?: string) {
  await connectDatabase();
  const existing = await PageModel.findById(pageId).lean() as any;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (storeId && String(existing.storeId) !== storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }

  const page = await PageModel.findByIdAndUpdate(pageId, { $set: { status: "draft" } }, { new: true }).lean() as any;
  return { ok: true as const, data: { page } };
}

export async function resetPage(pageId: string, storeId?: string) {
  await connectDatabase();
  const existing = await PageModel.findById(pageId).lean() as any;
  if (!existing) return { ok: false as const, message: "Page not found" };
  if (storeId && String(existing.storeId) !== storeId) {
    return { ok: false as const, message: "Page does not belong to this store" };
  }

  const page = await PageModel.findByIdAndUpdate(
    pageId,
    { $set: { sections: DEFAULT_TEMPLATE_SECTIONS, status: "draft" } },
    { new: true },
  ).lean() as any;
  return { ok: true as const, data: { page } };
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
