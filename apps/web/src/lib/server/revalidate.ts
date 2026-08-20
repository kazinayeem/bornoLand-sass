import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/server/cache-tags";

export type RevalidateScope = "all" | "home" | "products" | "cms" | "theme" | "categories" | "navigation";

export async function revalidateStorefront(args: {
  tenantSlug: string;
  storeId?: string;
  scope?: RevalidateScope;
  productSlug?: string;
  categorySlug?: string;
  cmsSlugs?: string[];
}) {
  const { tenantSlug, storeId, scope = "all", productSlug, categorySlug, cmsSlugs } = args;

  revalidateTag(cacheTags.tenant(tenantSlug));

  if (storeId) {
    revalidateTag(cacheTags.store(storeId));
    revalidateTag(cacheTags.cmsStore(storeId));
    revalidateTag(cacheTags.storeHomepage(storeId));
    revalidateTag(cacheTags.storeTheme(storeId));
  }

  revalidateTag(cacheTags.storeMetadata(tenantSlug));
  revalidateTag(cacheTags.storeBySlug(tenantSlug));

  if (scope === "all" || scope === "theme") {
    revalidateTag(cacheTags.tenantTheme(tenantSlug));
    if (storeId) revalidateTag(cacheTags.storeTheme(storeId));
  }

  if ((scope === "all" || scope === "cms") && storeId) {
    if (cmsSlugs?.length) {
      for (const slug of cmsSlugs) {
        revalidateTag(cacheTags.cmsPage(storeId, slug));
      }
    } else {
      revalidateTag(cacheTags.cmsStore(storeId));
    }
    revalidateTag(cacheTags.storeContact(storeId));
  }

  if ((scope === "all" || scope === "products") && productSlug) {
    revalidateTag(cacheTags.product(productSlug));
    if (storeId) revalidateTag(cacheTags.storeProduct(storeId, productSlug));
  }

  if ((scope === "all" || scope === "categories") && categorySlug && storeId) {
    revalidateTag(cacheTags.category(categorySlug));
    revalidateTag(cacheTags.storeCategory(storeId, categorySlug));
  }


  if (scope === "all" || scope === "categories") {
    revalidatePath(`/site/${tenantSlug}/categories`);
    if (categorySlug) {
      revalidatePath(`/site/${tenantSlug}/category/${categorySlug}`);
    }
  }

  if (scope === "all" || scope === "navigation") {
    revalidatePath(`/site/${tenantSlug}`);
  }

  revalidatePath(`/site/${tenantSlug}`);
  if (scope === "all" || scope === "home") {
    revalidatePath(`/site/${tenantSlug}`, "page");
  }
  if (scope === "all" || scope === "products") {
    revalidatePath(`/site/${tenantSlug}/shop`);
    if (productSlug) revalidatePath(`/products/${productSlug}`);
  }
  if (scope === "all" || scope === "cms") {
    for (const segment of ["about", "contact", "faq", "terms", "privacy", "shipping", "returns", "size-guide"]) {
      revalidatePath(`/site/${tenantSlug}/${segment}`);
    }
  }
}
