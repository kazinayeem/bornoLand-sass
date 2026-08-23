import type { CreateProductRequest, Product, ProductOption, ProductVariant } from "@/redux/api/product-api";
import { mediaSelectionFromUrl } from "@/lib/media-selection";
import type { MediaSelection } from "@/lib/media-selection";

export type ProductEditorTab = "general" | "media" | "variants" | "inventory" | "shipping" | "seo" | "advanced";

export type ProductEditorForm = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  productType: "simple" | "variable" | "digital" | "service" | "downloadable";
  price: string;
  comparePrice: string;
  stock: string;
  category: string;
  categoryId: string;
  subcategoryId: string;
  categoryIds: string[];
  status: "active" | "inactive" | "draft" | "archived";
  sku: string;
  barcode: string;
  brand: string;
  brandId: string;
  vendor: string;
  tags: string;
  imageUrl: string;
  thumbnailUrl: string;
  featuredImageId: string;
  gallery: MediaSelection[];
  featured: boolean;
  trackInventory: boolean;
  lowStockThreshold: string;
  weight: string;
  weightUnit: string;
  dimensionsLength: string;
  dimensionsWidth: string;
  dimensionsHeight: string;
  dimensionsUnit: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  internalNotes: string;
  internalTags: string;
};

export type VariantDraft = {
  options: ProductOption[];
  variants: ProductVariant[];
};

export const EMPTY_PRODUCT_FORM: ProductEditorForm = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  productType: "simple",
  price: "",
  comparePrice: "",
  stock: "0",
  category: "",
  categoryId: "",
  subcategoryId: "",
  categoryIds: [],
  status: "draft",
  sku: "",
  barcode: "",
  brand: "",
  brandId: "",

  vendor: "",
  tags: "",
  imageUrl: "",
  thumbnailUrl: "",
  featuredImageId: "",
  gallery: [],
  featured: false,
  trackInventory: true,
  lowStockThreshold: "5",
  weight: "",
  weightUnit: "kg",
  dimensionsLength: "",
  dimensionsWidth: "",
  dimensionsHeight: "",
  dimensionsUnit: "cm",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  internalNotes: "",
  internalTags: "",
};

export const EMPTY_VARIANT_DRAFT: VariantDraft = { options: [], variants: [] };

export function genSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function productToForm(product: Product): ProductEditorForm {
  const seo = (product as Product & { seo?: { title?: string; description?: string; keywords?: string[] } }).seo;
  return {
    name: product.name,
    slug: product.slug,
    shortDescription: "",
    description: product.description || "",
    productType: product.productType === "variable" ? "variable" : product.productType === "digital" ? "digital" : product.productType === "service" ? "service" : "simple",
    price: String(product.price ?? ""),
    comparePrice: product.comparePrice ? String(product.comparePrice) : "",
    stock: String(product.stock ?? 0),
    category: product.category || "",
    categoryId: (product as any).categoryId || (product.categoryIds?.[0] || ""),
    subcategoryId: (product as any).subcategoryId || (product.categoryIds?.[1] || ""),
    categoryIds: product.categoryIds ?? [],
    status: (product.status as ProductEditorForm["status"]) ?? "active",
    sku: product.sku || "",
    barcode: (product as Product & { barcode?: string }).barcode || "",
    brand: (product as Product & { brand?: string }).brand || "",
    brandId: (product as any).brandId || "",
    vendor: (product as Product & { vendor?: string }).vendor || "",

    tags: ((product as Product & { tags?: string[] }).tags ?? []).join(", "),
    imageUrl: product.imageUrl || "",
    thumbnailUrl: product.thumbnailUrl || "",
    featuredImageId: product.featuredImageId || "",
    gallery: (product.galleryImageUrls ?? []).map((url, index) =>
      mediaSelectionFromUrl(url, product.galleryImageIds?.[index])
    ),
    featured: product.featured,
    trackInventory: (product as Product & { trackInventory?: boolean }).trackInventory ?? true,
    lowStockThreshold: String((product as Product & { lowStockThreshold?: number }).lowStockThreshold ?? 5),
    weight: (product as Product & { weight?: number }).weight != null ? String((product as Product & { weight?: number }).weight) : "",
    weightUnit: (product as Product & { weightUnit?: string }).weightUnit || "kg",
    dimensionsLength: "",
    dimensionsWidth: "",
    dimensionsHeight: "",
    dimensionsUnit: "cm",
    seoTitle: seo?.title || "",
    seoDescription: seo?.description || "",
    seoKeywords: (seo?.keywords ?? []).join(", "),
    internalNotes: "",
    internalTags: "",
  };
}

export function duplicateFormFromProduct(product: Product): ProductEditorForm {
  const base = productToForm(product);
  return {
    ...base,
    name: `${product.name} (Copy)`,
    slug: `${product.slug}-copy-${Date.now()}`,
    status: "draft",
    sku: product.sku ? `${product.sku}-COPY` : "",
    featured: false,
  };
}

export function buildProductPayload(
  form: ProductEditorForm,
  variantDraft: VariantDraft,
  options?: { forceStatus?: ProductEditorForm["status"] }
): CreateProductRequest & Record<string, unknown> {
  const normalizedOptions = variantDraft.options
    .map((option, index) => ({
      ...option,
      name: option.name.trim(),
      values: option.values.map((v) => v.trim()).filter(Boolean),
      position: index,
    }))
    .filter((option) => option.name);

  const normalizedVariants = variantDraft.variants
    .filter((variant) => Object.keys(variant.optionValues ?? {}).length > 0)
    .map((variant) => ({
      ...variant,
      title: variant.title || Object.values(variant.optionValues).join(" / "),
    }));

  const shouldSendVariants =
    form.productType === "variable" ||
    normalizedOptions.length > 0 ||
    normalizedVariants.length > 0;

  const resolvedPrice =
    form.price !== ""
      ? Number(form.price)
      : normalizedVariants.find((v) => typeof v.price === "number")?.price ?? 0;

  const status = options?.forceStatus ?? form.status;

  return {
    name: form.name.trim(),
    slug: form.slug || genSlug(form.name),
    productType: form.productType,
    price: resolvedPrice,
    comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
    stock: Number(form.stock) || 0,
    category: form.category,
    status,
    sku: form.sku,
    barcode: form.barcode || undefined,
    brand: form.brand || undefined,
    vendor: form.vendor || undefined,
    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    imageUrl: form.imageUrl,
    thumbnailUrl: form.thumbnailUrl || undefined,
    featuredImageId: form.featuredImageId || undefined,
    galleryImageIds: form.gallery.map((g) => g.mediaId).filter(Boolean) as string[],
    galleryImageUrls: form.gallery.map((g) => g.url).filter(Boolean),
    description: form.description,
    featured: form.featured,
    categoryId: form.categoryId || undefined,
    subcategoryId: form.subcategoryId || undefined,
    brandId: form.brandId || undefined,
    categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,

    trackInventory: form.trackInventory,
    lowStockThreshold: Number(form.lowStockThreshold) || 5,
    weight: form.weight ? Number(form.weight) : undefined,
    weightUnit: form.weightUnit || "kg",
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
      keywords: form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
    },
    ...(shouldSendVariants
      ? {
          options: form.productType === "variable" ? normalizedOptions : [],
          variants: form.productType === "variable" ? normalizedVariants : [],
        }
      : {}),
  };
}
