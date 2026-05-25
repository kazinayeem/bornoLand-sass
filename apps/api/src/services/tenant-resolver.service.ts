import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { PageModel } from "../models/page.model.js";
import { ProductModel } from "../models/product.model.js";
import { StoreSettingsModel } from "../models/store-settings.model.js";
import { HomepageSliderModel } from "../models/homepage-slider.model.js";

export type TenantStoreResponse = {
  store: Record<string, unknown> | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: Record<string, unknown>[];
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
  const page = await PageModel.findOne({ storeId: store._id, slug: "home", status: "published" }).lean() as any;
  const products = await ProductModel.find({ storeId: store._id, status: "active" }).sort({ createdAt: -1 }).limit(20).lean() as any[];
  const settings = await StoreSettingsModel.findOne({ storeId: store._id }).lean() as any;
  const sliders = await HomepageSliderModel.find({ storeId: store._id, isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean() as any[];

  return {
    ok: true,
    data: {
      store: store ?? null,
      tenant: tenant ?? null,
      page: page ?? null,
      products: products ?? [],
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
