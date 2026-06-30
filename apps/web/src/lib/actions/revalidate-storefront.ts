"use server";

import { revalidateStorefront, type RevalidateScope } from "@/lib/server/revalidate";

export async function revalidateStorefrontAction(args: {
  tenantSlug: string;
  storeId: string;
  scope?: RevalidateScope;
  productSlug?: string;
  cmsSlugs?: string[];
}) {
  await revalidateStorefront(args);
}
