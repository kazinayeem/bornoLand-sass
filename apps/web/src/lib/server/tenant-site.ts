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
};

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

async function fetchTenantSiteRemote(slug: string): Promise<TenantSiteData | null> {
  try {
    const res = await fetch(`${apiUrl}/public/tenant/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Public storefront loader — ISR via unstable_cache + request memoization.
 * Invalidated by revalidateTag(`tenant-${slug}`) on publish/product/CMS/theme updates.
 */
const getCachedTenantSite = (slug: string) =>
  unstable_cache(
    () => fetchTenantSiteRemote(slug),
    ["tenant-site", slug],
    {
      revalidate: CACHE_REVALIDATE.storefront,
      tags: [cacheTags.tenant(slug), cacheTags.tenantTheme(slug)],
    },
  )();

export const fetchTenantSite = cache(async (slug: string): Promise<TenantSiteData | null> => {
  return getCachedTenantSite(slug);
});
