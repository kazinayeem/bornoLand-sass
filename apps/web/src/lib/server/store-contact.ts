import "server-only";

import { cache } from "react";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import { getApiUrl } from "@/lib/urls";

const API_BASE = getApiUrl();

export type StoreContactData = {
  businessName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  googleMapsEmbedUrl?: string;
  latitude?: string;
  longitude?: string;
  businessHours?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    x?: string;
    linkedin?: string;
    youtube?: string;
    telegram?: string;
  };
};

type ContactResponse = {
  success?: boolean;
  data?: { contact?: StoreContactData };
};

export const fetchStoreContact = cache(async (storeId: string): Promise<StoreContactData | null> => {
  try {
    const response = await fetch(`${API_BASE}/public/contact?storeId=${storeId}`, {
      next: {
        revalidate: CACHE_REVALIDATE.cms,
        tags: [cacheTags.storeContact(storeId), cacheTags.cmsStore(storeId)],
      },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ContactResponse;
    return payload?.data?.contact ?? null;
  } catch {
    return null;
  }
});

export async function getStoreContactForTenant(tenant: string, storeId?: string): Promise<StoreContactData | null> {
  if (!storeId) {
    const { fetchTenantSite } = await import("@/lib/server/tenant-site");
    const data = await fetchTenantSite(tenant);
    storeId = (data?.store as { _id?: string } | null)?._id;
  }
  if (!storeId) return null;
  return fetchStoreContact(storeId);
}
