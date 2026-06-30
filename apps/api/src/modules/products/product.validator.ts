import { z } from "zod";

const mediaUrlSchema = z
  .string()
  .refine((value) => value === "" || value.startsWith("/") || /^https?:\/\//.test(value), {
    message: "Invalid media URL",
  });

const optionSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(100),
  values: z.array(z.string().min(1)).min(1),
  displayType: z.enum(["dropdown", "button", "color_swatch", "image_swatch"]).optional(),
  position: z.number().int().min(0).optional(),
});

const variantSchema = z.object({
  _id: z.string().optional(),
  optionValues: z.record(z.string(), z.string()),
  title: z.string().optional(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional(),
  wholesalePrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional().default(0),
  lowStockThreshold: z.number().int().min(0).optional(),
  sku: z.string().max(100).optional().default(""),
  barcode: z.string().max(100).optional().default(""),
  imageUrl: z.string().optional().default(""),
  imageMediaIds: z.array(z.string()).optional().default([]),
  galleryUrls: z.array(z.string()).optional().default([]),
  enabled: z.boolean().optional().default(true),
  status: z.enum(["active", "draft", "out_of_stock", "archived", "hidden"]).optional(),
  isDefault: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  allowPreOrder: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  weight: z.number().min(0).optional(),
  weightUnit: z.string().optional(),
  dimensions: z
    .object({
      length: z.number().min(0).optional(),
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
      unit: z.string().optional(),
    })
    .optional(),
  taxClass: z.string().optional(),
  seo: z
    .object({
      slug: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

const seoSchema = z.object({
  title: z.string().max(200).optional().default(""),
  description: z.string().max(500).optional().default(""),
  keywords: z.array(z.string()).optional().default([]),
});

const digitalAssetSchema = z.object({
  fileUrl: z.string().optional().default(""),
  fileName: z.string().optional().default(""),
  downloadLimit: z.number().int().min(0).optional().default(0),
  expiryDays: z.number().int().min(0).optional().default(0),
});

const productFields = {
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).optional().default(""),
  productType: z.enum(["simple", "variable", "digital", "downloadable", "service"]).optional().default("simple"),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  category: z.string().max(100).optional().default("general"),
  categoryIds: z.array(z.string()).optional().default([]),
  collectionIds: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  brand: z.string().max(100).optional().default(""),
  vendor: z.string().max(100).optional().default(""),
  barcode: z.string().max(100).optional().default(""),
  stock: z.number().int().min(0).optional().default(0),
  trackInventory: z.boolean().optional().default(true),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
  status: z.enum(["draft", "active", "archived", "scheduled", "inactive"]).optional().default("active"),
  scheduledAt: z.string().datetime().optional().nullable(),
  sku: z.string().max(100).optional().default(""),
  imageUrl: mediaUrlSchema.optional(),
  thumbnailUrl: mediaUrlSchema.optional(),
  featuredImageId: z.string().optional().nullable(),
  galleryImageIds: z.array(z.string()).optional().default([]),
  galleryImageUrls: z.array(mediaUrlSchema).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  videoUrl: z.string().optional().default(""),
  featured: z.boolean().optional().default(false),
  relatedProductIds: z.array(z.string()).optional().default([]),
  upsellProductIds: z.array(z.string()).optional().default([]),
  crossSellProductIds: z.array(z.string()).optional().default([]),
  weight: z.number().min(0).optional(),
  weightUnit: z.string().optional().default("kg"),
  digitalAsset: digitalAssetSchema.optional(),
  seo: seoSchema.optional(),
  options: z.array(optionSchema).optional().default([]),
  variants: z.array(variantSchema).optional().default([]),
};

export const createVariantSchema = variantSchema;
export const updateVariantSchema = variantSchema.partial();

export const createProductSchema = z.object(productFields);
export const updateProductSchema = z.object(productFields).partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
