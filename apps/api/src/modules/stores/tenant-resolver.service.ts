import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { TenantModel } from "../../models/tenant.model.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { ProductModel } from "../../models/product.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { HomepageSliderModel } from "../../models/homepage-slider.model.js";
import { NavigationModel } from "../navigation/navigation.model.js";
import { MenuItemModel } from "../navigation/menu-item.model.js";
import { getPublicStoreContact } from "../stores/store-contact.service.js";
import { getPublicStoreTracking } from "./store-tracking.service.js";

export type TenantStoreResponse = {
  store: Record<string, unknown> | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  settings: Record<string, unknown> | null;
  sliders: Record<string, unknown>[];
  navigations?: Record<string, unknown>[];
  contact?: Record<string, unknown> | null;
  tracking?: Record<string, unknown> | null;
};

/**
 * Database is the source of truth for tenant identity.
 * Looks up by customDomains[], Tenant.customDomain, subdomain, then slug.
 */
export async function findStoreByHostKey(key: string): Promise<Record<string, unknown> | null> {
  await connectDatabase();
  const normalized = key.trim().toLowerCase();
  if (!normalized) return null;

  const validStatus = { status: { $ne: "archived" } };

  // 1. Check customDomains
  let store = (await StoreModel.findOne({
    customDomains: normalized,
    ...validStatus,
  }).lean()) as Record<string, unknown> | null;

  // 2. Check tenant customDomain
  if (!store) {
    const tenant = (await TenantModel.findOne({
      customDomain: normalized,
      status: { $ne: "suspended" },
    }).lean()) as { _id?: unknown } | null;
    if (tenant?._id) {
      store = (await StoreModel.findOne({
        tenantId: tenant._id,
        ...validStatus,
      }).lean()) as Record<string, unknown> | null;
    }
  }

  // 3. Check subdomain (case-insensitive)
  if (!store) {
    store = (await StoreModel.findOne({
      $or: [{ subdomain: normalized }, { subdomain: key.trim() }],
      ...validStatus,
    }).lean()) as Record<string, unknown> | null;
  }

  // 4. Check slug (case-insensitive)
  if (!store) {
    store = (await StoreModel.findOne({
      $or: [{ slug: normalized }, { slug: key.trim() }],
      ...validStatus,
    }).lean()) as Record<string, unknown> | null;
  }

  // 5. Fallback: check by _id if key is valid ObjectId
  if (!store) {
    try {
      const { requireObjectId } = await import("../../common/utils/object-id.js");
      if (requireObjectId(key).ok) {
        store = (await StoreModel.findOne({
          _id: key,
          ...validStatus,
        }).lean()) as Record<string, unknown> | null;
      }
    } catch {
      // Ignored
    }
  }

  return store;
}

function buildMenuItemTree(items: Array<Record<string, unknown>>) {
  const map = new Map<string, Record<string, unknown> & { children: Array<Record<string, unknown>> }>();
  const roots: Array<Record<string, unknown>> = [];

  for (const item of items) {
    map.set(String(item._id), { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(String(item._id));
    if (!node) continue;
    const parentId = item.parentId ? String(item.parentId) : null;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function resolveBySubdomain(
  slug: string,
  pageSlug: string = "home"
): Promise<{
  ok: boolean;
  data?: TenantStoreResponse;
  message?: string;
}> {
  await connectDatabase();

  const store = (await findStoreByHostKey(slug)) as any;
  if (!store) {
    return { ok: false, message: "Store not found" };
  }

  const tenant = await TenantModel.findById(store.tenantId).lean() as any;
  // StorePageModel uses "/" for home, "/shop" for shop, etc.
  let normalizedSlug: string;
  if (pageSlug === "home" || pageSlug === "/") {
    normalizedSlug = "/";
  } else {
    normalizedSlug = pageSlug.startsWith("/") ? pageSlug : `/${pageSlug}`;
  }
  const page = await StorePageModel.findOne({
    storeId: store._id,
    slug: normalizedSlug.toLowerCase(),
    status: "published",
    deletedAt: null,
  }).lean() as any;

  let resolvedPage = page;
  if (!resolvedPage && normalizedSlug !== "/") {
    // If specific CMS page is not found as a custom StorePage, fetch the home page's layout configuration
    const homePage = await StorePageModel.findOne({
      storeId: store._id,
      slug: "/",
      status: "published",
      deletedAt: null,
    }).lean() as any;
    if (homePage) {
      resolvedPage = {
        _id: "global-shell",
        title: store.name,
        slug: normalizedSlug,
        headerSections: homePage.headerSections || [],
        footerSections: homePage.footerSections || [],
        headerSettings: homePage.headerSettings || store.headerSettings || {},
        footerSettings: homePage.footerSettings || store.footerSettings || {},
        sections: [],
      };
    }
  } else if (resolvedPage && normalizedSlug !== "/") {
    // Merge home page global header/footer as base; sub-page overrides win when set
    const homePage = await StorePageModel.findOne({
      storeId: store._id,
      slug: "/",
      status: "published",
      deletedAt: null,
    }).lean() as any;
    if (homePage) {
      resolvedPage.headerSettings = {
        ...(homePage.headerSettings || store.headerSettings || {}),
        ...(resolvedPage.headerSettings || {}),
      };
      resolvedPage.footerSettings = {
        ...(homePage.footerSettings || store.footerSettings || {}),
        ...(resolvedPage.footerSettings || {}),
      };
    }
  }

  const products = await ProductModel.find({ storeId: store._id, status: "active" }).sort({ createdAt: -1 }).limit(20).lean() as any[];
  const rawCategories = await CategoryModel.find({ storeId: store._id, active: true }).sort({ sortOrder: 1, name: 1 }).lean() as any[];
  const { enrichCategoriesWithCounts } = await import("../categories/category.service.js");
  const categories = await enrichCategoriesWithCounts(String(store._id), rawCategories);
  const settings = await StoreSettingsModel.findOne({ storeId: store._id }).lean() as any;
  const sliders = await HomepageSliderModel.find({ storeId: store._id, isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean() as any[];
  const navigations = await NavigationModel.find({ storeId: store._id, isActive: true }).sort({ sortOrder: 1 }).lean() as any[];
  const navigationTrees = await Promise.all(
    navigations.map(async (navigation) => {
      const items = await MenuItemModel.find({
        navigationId: navigation._id,
        isVisible: { $ne: false },
      })
        .sort({ sortOrder: 1 })
        .lean() as any[];
      return { ...navigation, items: buildMenuItemTree(items) };
    }),
  );
  const [contactResult, trackingResult] = await Promise.all([
    getPublicStoreContact(String(store._id)),
    getPublicStoreTracking(String(store._id)),
  ]);

  return {
    ok: true,
    data: {
      store: store ?? null,
      tenant: tenant ?? null,
      page: resolvedPage ?? null,
      products: products ?? [],
      categories: categories ?? [],
      settings: settings ?? null,
      sliders: sliders ?? [],
      navigations: navigationTrees ?? [],
      contact: contactResult.data?.contact ?? null,
      tracking: trackingResult ?? null,
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
