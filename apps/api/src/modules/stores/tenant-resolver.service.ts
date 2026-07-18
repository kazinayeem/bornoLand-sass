import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { TenantModel } from "../../models/tenant.model.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { ProductModel } from "../../models/product.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { HomepageSliderModel } from "../../models/homepage-slider.model.js";

export type TenantStoreResponse = {
  store: Record<string, unknown> | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  settings: Record<string, unknown> | null;
  sliders: Record<string, unknown>[];
};

export async function resolveBySubdomain(
  slug: string,
  pageSlug: string = "home"
): Promise<{
  ok: boolean;
  data?: TenantStoreResponse;
  message?: string;
}> {
  await connectDatabase();

  let store = await StoreModel.findOne({ subdomain: slug, status: "active" }).lean() as any;
  if (!store) {
    store = await StoreModel.findOne({ slug: slug, status: "active" }).lean() as any;
  }
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  const tenant = await TenantModel.findById(store.tenantId).lean() as any;
  // StorePageModel uses leading "/" for slugs
  const normalizedSlug = pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`;
  const page = await StorePageModel.findOne({
    storeId: store._id,
    slug: normalizedSlug.toLowerCase(),
    status: "published",
    deletedAt: null,
  }).lean() as any;

  if (!page) {
    return { ok: false, message: `Page '${pageSlug}' not found or not published` };
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
