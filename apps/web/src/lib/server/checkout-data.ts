import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getApiUrl } from "@/lib/urls";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";

export type PublicPaymentMethod = {
  _id: string;
  storeId: string;
  type: string;
  label?: string;
  accountNumber?: string;
  accountType?: string;
  instructions?: string;
  logoUrl?: string;
  bankName?: string;
  branch?: string;
  accountName?: string;
  routingNumber?: string;
  swift?: string;
  enabled: boolean;
  sortOrder?: number;
};

export type PublicDeliveryZone = {
  _id: string;
  storeId: string;
  name: string;
  charge: number;
  estimatedDays: string;
  enabled: boolean;
  sortOrder?: number;
  divisions?: string[];
  districts?: string[];
  postalCodes?: string[];
};

async function fetchPublicPaymentMethodsRemote(storeId: string): Promise<PublicPaymentMethod[]> {
  const apiBase = getApiUrl();
  try {
    const url = `${apiBase}/public/payment-methods?storeId=${encodeURIComponent(storeId)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data?.paymentMethods) ? json.data.paymentMethods : [];
  } catch {
    return [];
  }
}

async function fetchPublicDeliveryZonesRemote(storeId: string): Promise<PublicDeliveryZone[]> {
  const apiBase = getApiUrl();
  try {
    const url = `${apiBase}/public/delivery-zones?storeId=${encodeURIComponent(storeId)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data?.deliveryZones) ? json.data.deliveryZones : [];
  } catch {
    return [];
  }
}

export const fetchPublicPaymentMethods = cache(
  async (storeId?: string, tenantSlug?: string): Promise<PublicPaymentMethod[]> => {
    if (!storeId) return [];
    try {
      try {
        return await unstable_cache(
          () => fetchPublicPaymentMethodsRemote(storeId),
          ["public-payment-methods", storeId],
          {
            revalidate: CACHE_REVALIDATE.storefront,
            tags: tenantSlug ? [cacheTags.tenant(tenantSlug)] : undefined,
          },
        )();
      } catch (cacheErr: any) {
        if (cacheErr?.message?.includes("incrementalCache missing")) {
          return await fetchPublicPaymentMethodsRemote(storeId);
        }
        throw cacheErr;
      }
    } catch {
      return [];
    }
  },
);

export const fetchPublicDeliveryZones = cache(
  async (storeId?: string, tenantSlug?: string): Promise<PublicDeliveryZone[]> => {
    if (!storeId) return [];
    try {
      try {
        return await unstable_cache(
          () => fetchPublicDeliveryZonesRemote(storeId),
          ["public-delivery-zones", storeId],
          {
            revalidate: CACHE_REVALIDATE.storefront,
            tags: tenantSlug ? [cacheTags.tenant(tenantSlug)] : undefined,
          },
        )();
      } catch (cacheErr: any) {
        if (cacheErr?.message?.includes("incrementalCache missing")) {
          return await fetchPublicDeliveryZonesRemote(storeId);
        }
        throw cacheErr;
      }
    } catch {
      return [];
    }
  },
);
