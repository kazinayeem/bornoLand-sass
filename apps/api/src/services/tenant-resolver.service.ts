import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { PageModel } from "../models/page.model.js";
import { ProductModel } from "../models/product.model.js";
import { CategoryModel } from "../models/category.model.js";
import { StoreSettingsModel } from "../models/store-settings.model.js";
import { HomepageSliderModel } from "../models/homepage-slider.model.js";

export type TenantStoreResponse = {
  store: Record<string, unknown> | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  settings: Record<string, unknown> | null;
  sliders: Record<string, unknown>[];
};

/**
 * Resolves a store + tenant + home page by subdomain slug.
 * Used by the public-facing site renderer and the Next.js middleware.
 */
export async function resolveBySubdomain(slug: string): Promise<{
  ok: boolean;
  data?: TenantStoreResponse;
  message?: string;
}> {
  await connectDatabase();

  const store = await StoreModel.findOne({ subdomain: slug, status: "active" }).lean() as any;
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  const tenant = await TenantModel.findById(store.tenantId).lean() as any;
  let page = await PageModel.findOne({ storeId: store._id, slug: "home", publishStatus: "published" }).lean() as any;
  // backward-compat: if no publishStatus set, try legacy status field or any page
  if (!page) {
    page = await PageModel.findOne({ storeId: store._id, slug: "home" }).sort({ updatedAt: -1 }).lean() as any;
  }
  const storeSections = (store.publishedSections ?? store.homepageSections ?? []) as Record<string, unknown>[];
  const storeTheme = store.homepageConfig?.theme ?? store.theme ?? {};
  console.log("[tenant] resolveBySubdomain", {
    slug,
    storeId: String(store._id),
    sectionCount: storeSections.length,
    hasPage: Boolean(page),
  });
  if (!page && storeSections.length > 0) {
    page = {
      storeId: store._id,
      slug: "home",
      title: "Home",
      sections: storeSections,
      theme: storeTheme,
      publishStatus: "published",
    } as any;
  }
  // normalize to expose live sections/theme to storefront
  if (page) {
    page.sections = storeSections.length > 0 ? storeSections : page.publishedSections ?? page.sections ?? page.draftSections ?? [];
    page.theme = storeTheme ?? page.publishedTheme ?? page.theme ?? page.draftTheme ?? {};
  }
  const products = await ProductModel.find({ storeId: store._id, status: "active" }).sort({ createdAt: -1 }).limit(20).lean() as any[];
  const categories = await CategoryModel.find({ storeId: store._id, active: true }).sort({ sortOrder: 1, name: 1 }).lean() as any[];
  const settings = await StoreSettingsModel.findOne({ storeId: store._id }).lean() as any;
  const sliders = await HomepageSliderModel.find({ storeId: store._id, isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean() as any[];

  return {
    ok: true,
    data: {
      store: store ?? null,
      tenant: tenant ?? null,
      page: page ?? null,
      products: products ?? [],
      categories: categories ?? [],
      settings: settings ?? null,
      sliders: sliders ?? [],
    },
  };
}

/**
 * Resolves a store by its ID (for authenticated requests).
 */
export async function resolveById(storeId: string) {
  await connectDatabase();

  const store = await StoreModel.findById(storeId).lean() as any;
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  const tenant = await TenantModel.findById(store.tenantId).lean() as any;

  return {
    ok: true,
    data: { store, tenant: tenant ?? null },
  };
}
