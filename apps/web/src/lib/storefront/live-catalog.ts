import type { Category } from "@/redux/api/category-api";
import type { ProductData } from "@/providers/tenant-provider";
import { getStorefrontTenantHeaders } from "@/lib/tenant-resolution";
import { getApiUrl } from "@/lib/urls";

export type LiveTenantCatalog = {
  categories: Category[];
  products: ProductData[];
};

const inflight = new Map<string, Promise<LiveTenantCatalog | null>>();

/**
 * Fetch the current store catalog from the public tenant API (no auth, no ISR cache).
 * Deduplicates concurrent requests per store slug.
 */
export function fetchLiveTenantCatalog(storeSlug: string): Promise<LiveTenantCatalog | null> {
  const slug = storeSlug.trim();
  if (!slug) return Promise.resolve(null);

  const pending = inflight.get(slug);
  if (pending) return pending;

  const apiBase = getApiUrl().replace(/\/$/, "");
  const request = fetch(`${apiBase}/public/tenant/${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json", ...getStorefrontTenantHeaders() },
    credentials: "include",
    cache: "no-store",
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const json = (await res.json()) as {
        data?: { categories?: Category[]; products?: ProductData[] };
      };
      return {
        categories: json.data?.categories ?? [],
        products: json.data?.products ?? [],
      };
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(slug);
    });

  inflight.set(slug, request);
  return request;
}

export function invalidateLiveTenantCatalogCache(storeSlug?: string) {
  if (storeSlug) {
    inflight.delete(storeSlug.trim());
    return;
  }
  inflight.clear();
}
