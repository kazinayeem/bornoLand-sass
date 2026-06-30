import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import type { Store } from "@/redux/api/store-api";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";

/**
 * Authenticated store context loader — Server Component only.
 * Uses fetch cache + React request memoization (not unstable_cache) because
 * the upstream API validates session cookies per user.
 * StoreProvider hydrates once; client navigations do not refetch on mount.
 */

const API_BASE = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

type StoreResponse = {
  success?: boolean;
  data?: { store?: Store };
};

export const getStoreContext = cache(async (storeSlug: string): Promise<Store | null> => {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${API_BASE}/stores/by-slug/${storeSlug}`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      next: {
        revalidate: CACHE_REVALIDATE.storeContext,
        tags: [cacheTags.storeBySlug(storeSlug), cacheTags.storeMetadata(storeSlug)],
      },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as StoreResponse;
    return payload?.data?.store ?? null;
  } catch {
    return null;
  }
});
