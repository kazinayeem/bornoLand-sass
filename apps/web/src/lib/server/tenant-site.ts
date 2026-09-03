import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";

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
  // Server-side: prefer explicit API_URL over NEXT_PUBLIC_API_URL (which is /api, a relative path)
  const serverUrl = (process.env.API_URL ?? "").trim();
  if (serverUrl && (serverUrl.startsWith("http://") || serverUrl.startsWith("https://"))) {
    return serverUrl.replace(/\/$/, "");
  }
  // Fallback: NEXT_PUBLIC_API_URL is /api in production — unusable for server Node fetch
  const fallback = "http://localhost:4000";
  const sourceVar = serverUrl ? `API_URL="${serverUrl}"` : "API_URL not set";
  console.warn(`[tenant-site] ${sourceVar} is not an absolute URL — falling back to ${fallback}`);
  return fallback;
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

  // Always log in production for diagnostic purposes (no secrets exposed)
  const isDiagnostic = process.env.DEBUG_TENANT_ROUTING === "1";
  const isDevOrDiag = process.env.NODE_ENV === "development" || isDiagnostic;

  console.log(
    `[store-render-debug] slug="${slug}" page="${pageSlug ?? "home"}" API_URL="${process.env.API_URL ?? "(not set)"}" url="${url}"`,
  );

  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "network error";
    console.error(`[store-render-error] network failure slug="${slug}" url="${url}": ${message}`);
    if (error instanceof Error && error.stack) {
      console.error(`[store-render-error] stack:`, error.stack);
    }
    throw new Error(`Failed to reach tenant API for "${slug}": ${message}`);
  }

  console.log(
    `[store-render-debug] HTTP ${res.status} slug="${slug}" url="${url}"`,
  );

  if (res.status === 404) {
    if (isDevOrDiag) {
      console.log(`[store-render-debug] 404 store not found slug="${slug}"`);
    }
    throw new TenantNotFoundError(slug);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[store-render-error] upstream ${res.status} slug="${slug}" url="${url}": ${body.slice(0, 400)}`);
    throw new Error(`Tenant API returned ${res.status} for "${slug}"`);
  }

  const json = (await res.json()) as { data?: TenantSiteData };
  const data = json.data;
  if (!data?.store) {
    console.log(`[store-render-debug] API returned 200 but no store data for slug="${slug}"`);
    throw new TenantNotFoundError(slug);
  }

  console.log(
    `[store-render-debug] store found: id="${String((data.store as Record<string,unknown>)._id ?? "")}" slug="${String((data.store as Record<string,unknown>).slug ?? "")}" name="${String((data.store as { name?: string }).name ?? "")}"`
  );

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
      // unstable_cache may throw if the incremental cache is not available (standalone first cold start)
      if (
        cacheErr?.message?.includes("incrementalCache missing") ||
        cacheErr?.message?.includes("No incremental cache was available")
      ) {
        console.warn(`[store-render-debug] unstable_cache unavailable for slug="${slug}", bypassing cache`);
        return await fetchTenantSiteRemote(slug, pageSlug);
      }
      throw cacheErr;
    }
  } catch (error) {
    if (error instanceof TenantNotFoundError) return null;
    // Log unexpected errors so they appear in PM2 logs on EC2
    if (!(error instanceof TenantNotFoundError)) {
      console.error(`[store-render-error] Unhandled error for slug="${slug}":`, error);
      if (error instanceof Error && error.stack) {
        console.error(`[store-render-error] stack:`, error.stack);
      }
    }
    throw error;
  }
});
