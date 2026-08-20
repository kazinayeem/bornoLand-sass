import { revalidateStorefrontAction } from "@/lib/actions/revalidate-storefront";
import type { RevalidateScope } from "@/lib/server/revalidate";

type StoreLike = {
  _id?: string;
  slug?: string;
  subdomain?: string;
};

export async function revalidateStorefrontForStore(
  store: StoreLike,
  options?: {
    scope?: RevalidateScope;
    productSlug?: string;
    categorySlug?: string;
    cmsSlugs?: string[];
  },
) {
  await revalidateStorefrontAction({
    tenantSlug: store.subdomain || store.slug || "",
    storeId: store._id,
    scope: options?.scope ?? "all",
    productSlug: options?.productSlug,
    categorySlug: options?.categorySlug,
    cmsSlugs: options?.cmsSlugs,
  });
}

