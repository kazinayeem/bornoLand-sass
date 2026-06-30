import "server-only";

import type { Metadata } from "next";
import { cache } from "react";
import { cookies } from "next/headers";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import { getApiUrl, getAppOrigin, getTenantCanonicalUrl } from "@/lib/urls";

const API_BASE = getApiUrl();
const APP_NAME = "BornoLand";
const DEFAULT_FAVICON = "/favicon.ico";

type StoreResponse = {
  success?: boolean;
  data?: {
    store?: {
      _id: string;
      name: string;
      shortName?: string;
      slug: string;
      description?: string;
      logoUrl?: string;
      faviconUrl?: string;
    };
  };
};

type ProductResponse = {
  success?: boolean;
  data?: {
    product?: {
      _id: string;
      name: string;
      slug: string;
      description?: string;
      status?: string;
    };
  };
};

async function apiFetch<T>(path: string, options?: { public?: boolean }, tagSlug?: string): Promise<T | null> {
  try {
    const headers: Record<string, string> = {};
    if (!options?.public) {
      const cookieHeader = (await cookies()).toString();
      if (cookieHeader) headers.cookie = cookieHeader;
    }
    const response = await fetch(`${API_BASE}${path}`, {
      headers: Object.keys(headers).length ? headers : undefined,
      next: {
        revalidate: CACHE_REVALIDATE.metadata,
        tags: [path, cacheTags.storeBySlug(tagSlug ?? path), cacheTags.storeMetadata(tagSlug ?? path)],
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export const getStoreMetadataContext = cache(async (storeSlug: string) => {
  const payload = await apiFetch<StoreResponse>(`/stores/by-slug/${storeSlug}`, undefined, storeSlug);
  return payload?.data?.store ?? null;
});

export const getTenantMetadataContext = cache(async (tenant: string) => {
  const data = await fetchTenantSite(tenant);
  const store = data?.store as {
    name?: string;
    shortName?: string;
    description?: string;
    logoUrl?: string;
    faviconUrl?: string;
  } | null;
  if (!store) return null;
  return store;
});

export async function getProductMetadataContext(productId: string) {
  const payload = await apiFetch<ProductResponse>(`/products/item/${productId}`);
  return payload?.data?.product ?? null;
}

function resolveIconUrl(iconUrl?: string) {
  return iconUrl || DEFAULT_FAVICON;
}

export function buildPageMetadata(args: {
  title: string;
  description: string;
  canonicalPath?: string;
  iconUrl?: string;
  keywords?: string;
  ogImage?: string;
}): Metadata {
  const siteUrl = getAppOrigin();
  const canonicalPath = args.canonicalPath ?? "/";
  const canonical = canonicalPath.startsWith("http")
    ? canonicalPath
    : siteUrl
      ? `${siteUrl}${canonicalPath}`
      : canonicalPath;
  const icon = resolveIconUrl(args.iconUrl);
  const ogImage = args.ogImage || (args.iconUrl && args.iconUrl !== DEFAULT_FAVICON ? args.iconUrl : undefined);
  return {
    title: { absolute: args.title },
    description: args.description,
    keywords: args.keywords,
    alternates: { canonical },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      siteName: APP_NAME,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      title: args.title,
      description: args.description,
      card: ogImage ? "summary_large_image" : "summary",
      images: ogImage ? [ogImage] : undefined,
    },
    icons: {
      icon,
      shortcut: icon,
      apple: icon,
    },
  };
}

export async function generateStoreMetadata(args: {
  storeSlug: string;
  pageTitle: string;
  canonicalPath: string;
  description?: string;
}): Promise<Metadata> {
  const store = await getStoreMetadataContext(args.storeSlug);
  const storeName = store?.shortName || store?.name || "Store";
  return buildPageMetadata({
    title: `${args.pageTitle} • ${storeName}`,
    description: args.description ?? `${args.pageTitle} for ${storeName}.`,
    canonicalPath: args.canonicalPath,
    iconUrl: store?.faviconUrl || store?.logoUrl,
    keywords: [args.pageTitle, storeName, "dashboard", "ecommerce"].join(", "),
    ogImage: store?.logoUrl,
  });
}

export const generateStorePageMetadata = generateStoreMetadata;

export async function generateTenantMetadata(args: {
  tenant: string;
  pageTitle: string;
  canonicalPath: string;
  description?: string;
}): Promise<Metadata> {
  const store = await getTenantMetadataContext(args.tenant);
  const storeName = store?.shortName || store?.name || "Store";
  const storefrontPath = args.canonicalPath.replace(/^\/site\/[^/]+/, "") || "/";
  const canonicalUrl = getTenantCanonicalUrl(args.tenant, storefrontPath);
  const base = buildPageMetadata({
    title: `${args.pageTitle} • ${storeName}`,
    description: args.description ?? (store?.description || `${args.pageTitle} at ${storeName}.`),
    canonicalPath: canonicalUrl,
    iconUrl: store?.faviconUrl || store?.logoUrl,
    keywords: [args.pageTitle, storeName, "online store", "shop"].filter(Boolean).join(", "),
    ogImage: store?.logoUrl,
  });
  return base;
}

export async function generateProductPageMetadata(args: {
  storeSlug: string;
  productId: string;
  mode?: "edit" | "duplicate";
  canonicalPath: string;
}): Promise<Metadata> {
  const [store, product] = await Promise.all([
    getStoreMetadataContext(args.storeSlug),
    getProductMetadataContext(args.productId),
  ]);
  const storeName = store?.shortName || store?.name || "Store";
  const productName = product?.name ?? (args.mode === "duplicate" ? "Duplicate Product" : "Product");
  const title = args.mode === "duplicate" ? `Duplicate ${productName}` : productName;
  return buildPageMetadata({
    title: `${title} • ${storeName}`,
    description: product?.description || `${title} in ${storeName}.`,
    canonicalPath: args.canonicalPath,
    iconUrl: store?.faviconUrl || store?.logoUrl,
  });
}

export function generateAdminPageMetadata(args: {
  pageTitle: string;
  canonicalPath: string;
  description?: string;
}): Metadata {
  return buildPageMetadata({
    title: `${args.pageTitle} • Super Admin`,
    description: args.description ?? `${args.pageTitle} for Super Admin.`,
    canonicalPath: args.canonicalPath,
  });
}
