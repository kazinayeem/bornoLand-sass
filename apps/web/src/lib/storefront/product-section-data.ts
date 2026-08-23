import type { Product } from "@/redux/api/product-api";
import type { Category } from "@/redux/api/category-api";
import { getCategoryEnglishName } from "@/lib/storefront/category-label";

export type ProductSectionSource =
  | "featured"
  | "best-sellers"
  | "new-arrivals"
  | "manual"
  | "category";

function parseProductIds(raw?: string): string[] {
  if (!raw) return [];
  try {
    if (raw.startsWith("[")) return JSON.parse(raw) as string[];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

export function resolveProductSectionSource(
  sectionType: string,
  productSource?: string,
): ProductSectionSource {
  if (
    productSource === "featured" ||
    productSource === "best-sellers" ||
    productSource === "new-arrivals" ||
    productSource === "manual" ||
    productSource === "category"
  ) {
    return productSource;
  }
  if (sectionType === "best-sellers") return "best-sellers";
  if (sectionType === "new-arrivals") return "new-arrivals";
  if (sectionType === "trending-products") return "featured";
  return "featured";
}

export function isSectionPropEnabled(value: string | undefined, defaultEnabled = true): boolean {
  if (value === undefined || value === "") return defaultEnabled;
  return value !== "false";
}

export type ProductSectionQueryArgs = {
  page: number;
  limit: number;
  status: "active";
  featured?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

/** Build list query args for the product catalog API from section props. */
export function buildProductSectionQueryArgs(
  source: ProductSectionSource,
  props: Record<string, string | undefined>,
  categories: Category[],
): ProductSectionQueryArgs {
  const limit = Math.min(Math.max(Number(props.productCount) || 8, 1), 48);

  if (source === "featured") {
    return {
      page: 1,
      limit,
      status: "active",
      featured: "true",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }

  if (source === "new-arrivals") {
    return {
      page: 1,
      limit,
      status: "active",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }

  if (source === "category") {
    const slug = (props.categorySlug || "").trim();
    const match = slug
      ? categories.find((c) => c.slug === slug || c._id === slug)
      : undefined;
    return {
      page: 1,
      limit,
      status: "active",
      category: match?._id || slug || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }

  if (source === "manual") {
    return {
      page: 1,
      limit: Math.max(limit, 48),
      status: "active",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
  }

  // best-sellers — fetch a wider set; filter client-side when variant flags exist
  return {
    page: 1,
    limit: Math.max(limit, 24),
    status: "active",
    sortBy: "createdAt",
    sortOrder: "desc",
  };
}

function productHasBestSellerFlag(product: Product): boolean {
  const variants = product.variants ?? [];
  return variants.some((v) => v.isBestSeller === true);
}

/**
 * Apply section source rules on API product rows.
 * Never injects demo/hardcoded products — empty when nothing matches.
 */
export function resolveProductSectionDisplay(
  products: Product[],
  options: {
    sectionType: string;
    productSource?: string;
    productIds?: string;
    limit?: number;
  },
): Product[] {
  const limit = Math.min(Math.max(options.limit ?? 8, 1), 48);
  const source = resolveProductSectionSource(options.sectionType, options.productSource);
  const active = products.filter((p) => p.status === "active");

  if (source === "manual") {
    const selectedIds = parseProductIds(options.productIds);
    if (selectedIds.length === 0) return [];
    const ordered = selectedIds
      .map((id) => active.find((p) => p._id === id || p.slug === id))
      .filter((p): p is Product => Boolean(p));
    return ordered.slice(0, limit);
  }

  if (source === "best-sellers") {
    const flagged = active.filter(productHasBestSellerFlag);
    if (flagged.length > 0) return flagged.slice(0, limit);
    return active.slice(0, limit);
  }

  return active.slice(0, limit);
}

export function resolveProductCategoryLabel(
  product: Pick<Product, "category" | "categoryId" | "categoryIds" | "brand">,
  categories: Category[],
): string {
  const ids = [
    ...(product.categoryIds ?? []),
    product.categoryId,
  ].filter(Boolean) as string[];

  for (const id of ids) {
    const cat = categories.find((c) => c._id === id);
    if (cat) return getCategoryEnglishName(cat);
  }

  const slugOrName = product.category?.trim();
  if (slugOrName) {
    const bySlug = categories.find((c) => c.slug === slugOrName);
    if (bySlug) return getCategoryEnglishName(bySlug);
    return slugOrName;
  }

  return product.brand?.trim() || "";
}
