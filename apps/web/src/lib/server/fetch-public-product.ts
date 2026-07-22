import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import type { HomepageSliderData, ProductData, StoreData, StoreSettingsData } from "@/providers/tenant-provider";
import { getStorefrontTenantHeaders, resolveTenantFromHost } from "@/lib/tenant-resolution";
import { getApiUrl } from "@/lib/urls";

export type PublicProductPageData = {
  store: StoreData;
  tenant: Record<string, unknown> | null;
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  products: ProductData[];
  product: ProductData;
};

export async function fetchPublicProductPage(
  slug: string,
  host: string,
  tenantSlug?: string,
): Promise<PublicProductPageData | null> {
  try {
    const apiUrl = getApiUrl();
    if (!apiUrl) return null;
    const resolvedTenant =
      tenantSlug ?? resolveTenantFromHost(host).storeSlug;
    if (!resolvedTenant) return null;
    const res = await fetch(`${apiUrl}/public/product/${slug}`, {
      next: {
        revalidate: CACHE_REVALIDATE.product,
        tags: [cacheTags.product(slug), cacheTags.tenant(resolvedTenant)],
      },
      headers: getStorefrontTenantHeaders(host),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}
