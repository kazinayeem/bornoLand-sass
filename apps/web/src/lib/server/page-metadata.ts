import "server-only";

import type { Metadata } from "next";
import { cookies } from "next/headers";

const API_BASE = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const APP_NAME = "BornoLand";

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

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${API_BASE}${path}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getStoreMetadataContext(storeSlug: string) {
  const payload = await apiFetch<StoreResponse>(`/stores/by-slug/${storeSlug}`);
  return payload?.data?.store ?? null;
}

export async function getProductMetadataContext(productId: string) {
  const payload = await apiFetch<ProductResponse>(`/products/item/${productId}`);
  return payload?.data?.product ?? null;
}

export function buildPageMetadata(args: {
  title: string;
  description: string;
  canonicalPath: string;
  iconUrl?: string;
}): Metadata {
  const siteUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const canonical = siteUrl ? `${siteUrl}${args.canonicalPath}` : args.canonicalPath;
  return {
    title: args.title,
    description: args.description,
    alternates: { canonical },
    openGraph: {
      title: args.title,
      description: args.description,
      url: canonical,
      siteName: APP_NAME,
      type: "website",
    },
    twitter: {
      title: args.title,
      description: args.description,
      card: "summary_large_image",
    },
    icons: args.iconUrl
      ? {
          icon: args.iconUrl,
          shortcut: args.iconUrl,
          apple: args.iconUrl,
        }
      : undefined,
  };
}

export async function generateStoreMetadata(args: {
  storeSlug: string;
  pageTitle: string;
  canonicalPath: string;
  description?: string;
}): Promise<Metadata> {
  const store = await getStoreMetadataContext(args.storeSlug);
  const storeName = store?.name ?? "Store";
  return buildPageMetadata({
    title: `${args.pageTitle} • ${storeName}`,
    description: args.description ?? `${args.pageTitle} for ${storeName}.`,
    canonicalPath: args.canonicalPath,
    iconUrl: store?.faviconUrl || store?.logoUrl,
  });
}

export const generateStorePageMetadata = generateStoreMetadata;

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
  const storeName = store?.name ?? "Store";
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
