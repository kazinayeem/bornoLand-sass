import "server-only";

import { cache } from "react";

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

export const fetchTenantSite = cache(async (slug: string): Promise<TenantSiteData | null> => {
  try {
    const res = await fetch(`${apiUrl}/public/tenant/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
});
