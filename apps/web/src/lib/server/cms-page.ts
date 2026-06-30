import "server-only";

import { cache } from "react";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";

import { getApiUrl } from "@/lib/urls";

const API_BASE = getApiUrl();

import type { CmsPageData } from "@/lib/cms-page-types";

export type { CmsPageData };

type CmsPageResponse = {
  success?: boolean;
  data?: { page?: CmsPageData };
};

export const fetchCmsPage = cache(async (storeId: string, slug: string): Promise<CmsPageData | null> => {
  try {
    const response = await fetch(`${API_BASE}/public/page/${slug}?storeId=${storeId}`, {
      next: {
        revalidate: CACHE_REVALIDATE.cms,
        tags: [cacheTags.cmsPage(storeId, slug), cacheTags.cmsStore(storeId)],
      },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as CmsPageResponse;
    return payload?.data?.page ?? null;
  } catch {
    return null;
  }
});

export async function getCmsPageForTenant(tenant: string, cmsSlug: string, storeId?: string): Promise<CmsPageData | null> {
  if (!storeId) {
    const { fetchTenantSite } = await import("@/lib/server/tenant-site");
    const data = await fetchTenantSite(tenant);
    storeId = (data?.store as { _id?: string } | null)?._id;
  }
  if (!storeId) return null;
  return fetchCmsPage(storeId, cmsSlug);
}
