import "server-only";

import type { Metadata } from "next";
import { cache } from "react";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import { getApiUrl, getMetadataBaseUrl, getTenantCanonicalUrl } from "@/lib/urls";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

const API_BASE = getApiUrl();
const APP_NAME = "BornoLand";
const DEFAULT_FAVICON = "/logo.png";

type StoreMetadata = {
  _id: string;
  name: string;
  shortName?: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
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

function asStoreMetadata(store: Record<string, unknown>, fallbackSlug: string): StoreMetadata | null {
  const name = typeof store.name === "string" ? store.name : "";
  if (!name) return null;
  return {
    _id: String(store._id ?? ""),
    name,
    shortName: typeof store.shortName === "string" ? store.shortName : undefined,
    slug: typeof store.slug === "string" ? store.slug : fallbackSlug,
    description: typeof store.description === "string" ? store.description : undefined,
    logoUrl: typeof store.logoUrl === "string" ? store.logoUrl : undefined,
    faviconUrl: typeof store.faviconUrl === "string" ? store.faviconUrl : undefined,
  };
}

/** Public, cacheable store context for metadata only — never uses cookies. */
export const getStoreMetadataContext = cache(async (storeSlug: string): Promise<StoreMetadata | null> => {
  const data = await fetchTenantSite(storeSlug);
  if (!data?.store || typeof data.store !== "object") return null;
  return asStoreMetadata(data.store as Record<string, unknown>, storeSlug);
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

async function fetchPublicProduct(productId: string) {
  if (!API_BASE) return null;
  try {
    const response = await fetch(`${API_BASE}/products/item/${productId}`, {
      next: {
        revalidate: CACHE_REVALIDATE.metadata,
        tags: [cacheTags.product(productId)],
      },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ProductResponse;
    return payload?.data?.product ?? null;
  } catch {
    return null;
  }
}

export async function getProductMetadataContext(productId: string) {
  return fetchPublicProduct(productId);
}

export function resolveStoreFavicon(store?: { faviconUrl?: string; logoUrl?: string } | null): string {
  const raw = store?.faviconUrl?.trim() || store?.logoUrl?.trim();
  if (!raw) return DEFAULT_FAVICON;
  const resolved = resolveMediaUrl(raw);
  return resolved || DEFAULT_FAVICON;
}

export function resolveStoreOgImage(
  imageCandidate?: string | null,
  store?: { logoUrl?: string; faviconUrl?: string } | null,
): string | undefined {
  const raw = imageCandidate?.trim() || store?.logoUrl?.trim() || store?.faviconUrl?.trim();
  if (!raw) return undefined;
  const resolved = resolveMediaUrl(raw);
  return resolved || undefined;
}

function resolveIconUrl(iconUrl?: string) {
  if (!iconUrl || !iconUrl.trim()) return DEFAULT_FAVICON;
  const resolved = resolveMediaUrl(iconUrl.trim());
  return resolved || DEFAULT_FAVICON;
}

export function buildPageMetadata(args: {
  title: string;
  description: string;
  canonicalPath?: string;
  iconUrl?: string;
  keywords?: string;
  ogImage?: string;
}): Metadata {
  const siteUrl = getMetadataBaseUrl();
  const canonicalPath = args.canonicalPath ?? "/";
  const canonical = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${siteUrl}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
  const icon = resolveIconUrl(args.iconUrl);
  const ogImage = resolveStoreOgImage(args.ogImage, { logoUrl: args.iconUrl });
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
      icon: [{ url: icon }],
      shortcut: [{ url: icon }],
      apple: [{ url: icon }],
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

/**
 * Root customer storefront metadata generator for `app/site/[tenant]/layout.tsx`.
 * Configures the base metadata, tenant title template, dynamic favicon, and OpenGraph defaults.
 */
export async function generateTenantLayoutMetadata(tenant: string): Promise<Metadata> {
  const store = await getTenantMetadataContext(tenant);
  if (!store) {
    const defaultOrigin = getMetadataBaseUrl();
    return {
      metadataBase: new URL(defaultOrigin),
      title: {
        absolute: "Store Not Found | BornoLand",
      },
      description: "This store does not exist on BornoLand.",
      icons: {
        icon: [{ url: DEFAULT_FAVICON }],
        shortcut: [{ url: DEFAULT_FAVICON }],
        apple: [{ url: DEFAULT_FAVICON }],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const storeName = store?.shortName || store?.name || "Store";
  const description = store?.description || `${storeName} — Online Store.`;
  const canonicalUrl = getTenantCanonicalUrl(tenant, "/");
  const iconUrl = resolveStoreFavicon(store);
  const ogImage = resolveStoreOgImage(store?.logoUrl || store?.faviconUrl, store);
  const metadataBaseOrigin = getTenantCanonicalUrl(tenant, "/");

  return {
    metadataBase: new URL(metadataBaseOrigin),
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
      absolute: storeName,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
    openGraph: {
      title: storeName,
      description,
      url: canonicalUrl,
      siteName: storeName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export async function generateTenantMetadata(args: {
  tenant: string;
  pageTitle: string;
  canonicalPath: string;
  description?: string;
  ogImage?: string;
}): Promise<Metadata> {
  const store = await getTenantMetadataContext(args.tenant);
  if (!store) {
    const defaultOrigin = getMetadataBaseUrl();
    return {
      metadataBase: new URL(defaultOrigin),
      title: {
        absolute: "Store Not Found | BornoLand",
      },
      description: "This store does not exist on BornoLand.",
      icons: {
        icon: [{ url: DEFAULT_FAVICON }],
        shortcut: [{ url: DEFAULT_FAVICON }],
        apple: [{ url: DEFAULT_FAVICON }],
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const storeName = store?.shortName || store?.name || "Store";
  const storefrontPath = args.canonicalPath.replace(/^\/site\/[^/]+/, "") || "/";
  const canonicalUrl = getTenantCanonicalUrl(args.tenant, storefrontPath);
  const isHome = !args.pageTitle || args.pageTitle === "Home" || args.pageTitle === storeName;
  const title = isHome ? storeName : `${args.pageTitle} | ${storeName}`;
  const description = args.description ?? (store?.description || `${args.pageTitle} at ${storeName}.`);
  const iconUrl = resolveStoreFavicon(store);
  const ogImage = resolveStoreOgImage(args.ogImage, store);
  const metadataBaseOrigin = getTenantCanonicalUrl(args.tenant, "/");

  return {
    metadataBase: new URL(metadataBaseOrigin),
    title: {
      absolute: title,
    },
    description,
    keywords: [args.pageTitle, storeName, "online store", "shop"].filter(Boolean).join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: storeName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
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

export async function generateStorefrontPageMetadata(args: {
  storeSlug: string;
  pageSlug: string;
}): Promise<Metadata> {
  const data = await fetchTenantSite(args.storeSlug, args.pageSlug);
  const store = data?.store as any;
  const page = data?.page as any;
  const storeName = store?.shortName || store?.name || "Store";
  const pageTitle = page?.title || (args.pageSlug === "home" ? "Home" : args.pageSlug);
  const isHome = pageTitle === "Home" || pageTitle === "home";
  const seoTitle = page?.seo?.title || (isHome ? storeName : `${pageTitle} | ${storeName}`);
  const seoDescription = page?.seo?.description || store?.description || `${pageTitle} at ${storeName}.`;
  
  const siteUrl = getMetadataBaseUrl();
  const canonicalPath = `/store/${args.storeSlug}/${args.pageSlug === "home" ? "" : args.pageSlug}`;

  return buildPageMetadata({
    title: seoTitle,
    description: seoDescription,
    canonicalPath: canonicalPath,
    iconUrl: store?.faviconUrl || store?.logoUrl,
    keywords: [pageTitle, storeName, "online store", "shop"].filter(Boolean).join(", "),
    ogImage: store?.logoUrl,
  });
}

export async function generateStorefrontProductMetadata(args: {
  tenant: string;
  product: {
    name: string;
    description?: string;
    price?: number;
    comparePrice?: number;
    imageUrl?: string;
    slug: string;
    sku?: string;
    brand?: string;
    category?: string;
  };
}): Promise<Metadata> {
  const store = await getTenantMetadataContext(args.tenant);
  const storeName = store?.shortName || store?.name || "Store";
  const title = `${args.product.name} | ${storeName}`;
  const description =
    args.product.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
    `Buy ${args.product.name} online from ${storeName}.`;
  const canonicalUrl = getTenantCanonicalUrl(args.tenant, `/products/${args.product.slug}`);
  const iconUrl = resolveStoreFavicon(store);
  const ogImage = resolveStoreOgImage(args.product.imageUrl, store);
  const metadataBaseOrigin = getTenantCanonicalUrl(args.tenant, "/");

  return {
    metadataBase: new URL(metadataBaseOrigin),
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords: [args.product.name, args.product.brand, args.product.category, storeName].filter(Boolean).join(", "),
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: [{ url: iconUrl }],
      apple: [{ url: iconUrl }],
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: storeName,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export function buildProductJsonLd(args: {
  product: {
    _id?: string;
    name: string;
    description?: string;
    price: number;
    comparePrice?: number;
    imageUrl?: string;
    galleryImageUrls?: string[];
    slug: string;
    sku?: string;
    brand?: string;
    stock?: number;
    averageRating?: number;
    reviewCount?: number;
  };
  currencyCode?: string;
  storeName?: string;
  canonicalUrl?: string;
}) {
  const { product, currencyCode = "USD", storeName = "Store", canonicalUrl = "" } = args;
  const images = [product.imageUrl, ...(product.galleryImageUrls || [])].filter(Boolean) as string[];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    image: images.length > 0 ? images : undefined,
    sku: product.sku || product._id || product.slug,
    url: canonicalUrl,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : { "@type": "Brand", name: storeName },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: currencyCode,
      price: product.price,
      availability: (product.stock ?? 1) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: storeName,
      },
    },
  };

  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
    };
  }

  return schema;
}

export function buildCategoryJsonLd(args: {
  category: { name: string; description?: string; slug: string };
  canonicalUrl: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const { category, canonicalUrl, breadcrumbs = [] } = args;
  const items = breadcrumbs.map((bc, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: bc.name,
    item: bc.url,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

