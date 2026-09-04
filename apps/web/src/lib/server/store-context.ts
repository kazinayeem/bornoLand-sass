import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { Store, StoreContextData } from "@/redux/api/store-api";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import { getApiUrl } from "@/lib/urls";

/**
 * Authenticated store context loader — Server Component only.
 * Uses fetch cache + React request memoization (not unstable_cache) because
 * the upstream API validates session cookies per user.
 * StoreProvider hydrates once; client navigations do not refetch on mount.
 */

const API_BASE = getApiUrl();

export type StoreContextDataPayload = {
  store: Store | null;
  permissions?: string[];
  isOwner?: boolean;
  role?: string;
  features?: Record<string, unknown> | null;
  storageStats?: StoreContextData["storageStats"] | null;
};

type ContextResponse = {
  success?: boolean;
  data?: StoreContextDataPayload;
};

export const getStoreFullContext = cache(async (storeSlug: string): Promise<StoreContextDataPayload | null> => {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${API_BASE}/stores/by-slug/${storeSlug}/context`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      next: {
        revalidate: CACHE_REVALIDATE.storeContext,
        tags: [cacheTags.storeBySlug(storeSlug), cacheTags.storeMetadata(storeSlug)],
      },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as ContextResponse;
    return payload?.data ?? null;
  } catch {
    return null;
  }
});

export const getStoreContext = cache(async (storeSlug: string): Promise<Store | null> => {
  const context = await getStoreFullContext(storeSlug);
  return context?.store ?? null;
});
