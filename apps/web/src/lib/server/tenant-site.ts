import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import { getApiUrl } from "@/lib/urls";

export type TenantSiteData = {
  store: Record<string, unknown> | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: unknown[];
  categories?: unknown[];
  settings?: Record<string, unknown> | null;
  sliders?: unknown[];
  navigations?: unknown[];
  contact?: unknown;
  tracking?: Record<string, unknown> | null;
};

class TenantNotFoundError extends Error {
  constructor(slug: string) {
    super(`Store not found: ${slug}`);
    this.name = "TenantNotFoundError";
  }
}

function resolveApiBase(): string {
  const apiUrl = getApiUrl();
  // Relative `/api` works in the browser via Next rewrites, but Node fetch needs an absolute URL.
  if (!apiUrl || apiUrl.startsWith("/")) {
    const fallback = process.env.API_URL?.replace(/\/$/, "") || "http://localhost:4000";
    if (process.env.NODE_ENV === "development") {
      console.warn(`[tenant-site] Invalid API_URL "${apiUrl}", falling back to ${fallback}`);
    }
    return fallback;
  }
  return apiUrl;
}

/**
 * Live fetch — never cache misses or transport errors inside this function.
 * Returns data when the store exists. Throws TenantNotFoundError on hard 404.
 * Throws generic Error on network / 5xx so ISR cannot bake a sticky 404.
 */
async function fetchTenantSiteRemote(slug: string, pageSlug?: string): Promise<TenantSiteData> {
  const apiBase = resolveApiBase();
  const url = pageSlug
    ? `${apiBase}/public/tenant/${encodeURIComponent(slug)}?page=${encodeURIComponent(pageSlug)}`
    : `${apiBase}/public/tenant/${encodeURIComponent(slug)}`;

  if (process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1") {
    console.log(`[tenant-site] fetch slug="${slug}" page="${pageSlug ?? "home"}" url="${url}"`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "network error";
    console.error(`[tenant-site] network failure slug="${slug}": ${message}`);
    throw new Error(`Failed to reach tenant API for "${slug}": ${message}`);
  }

  if (res.status === 404) {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1") {
      console.log(`[tenant-site] 404 store not found slug="${slug}"`);
    }
    throw new TenantNotFoundError(slug);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[tenant-site] upstream ${res.status} slug="${slug}": ${body.slice(0, 200)}`);
    throw new Error(`Tenant API returned ${res.status} for "${slug}"`);
  }

  const json = (await res.json()) as { data?: TenantSiteData };
  const data = json.data;
  if (!data?.store) {
    throw new TenantNotFoundError(slug);
  }

  if (process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1") {
    console.log(
      `[tenant-site] ok slug="${slug}" store="${String((data.store as { name?: string }).name ?? "")}" page=${data.page ? "yes" : "no"}`,
    );
  }

  return data;
}

/**
 * Cache successful storefront payloads only.
 * Misses and errors are NOT written to unstable_cache (throws bypass the cache).
 */
const getCachedTenantSite = (slug: string, pageSlug?: string) => {
  const normSlug = slug.trim().toLowerCase();
  return unstable_cache(
    () => fetchTenantSiteRemote(normSlug, pageSlug),
    ["tenant-site", normSlug, pageSlug ?? "home"],
    {
      revalidate: CACHE_REVALIDATE.storefront,
      tags: [cacheTags.tenant(normSlug), cacheTags.tenantTheme(normSlug)],
    },
  )();
};

/**
 * Public storefront loader — ISR via unstable_cache + request memoization.
 * Invalidated by revalidateTag(`tenant-${slug}`) on publish/product/CMS/theme updates.
 *
 * Returns null only when the store truly does not exist (hard 404).
 * Transient API failures throw so Next.js will not cache a 404 page.
 */
export const fetchTenantSite = cache(async (slug: string, pageSlug?: string): Promise<TenantSiteData | null> => {
  try {
    try {
      return await getCachedTenantSite(slug, pageSlug);
    } catch (cacheErr: any) {
      if (cacheErr?.message?.includes("incrementalCache missing")) {
        return await fetchTenantSiteRemote(slug, pageSlug);
      }
      throw cacheErr;
    }
  } catch (error) {
    if (error instanceof TenantNotFoundError) return null;
    throw error;
  }
});
