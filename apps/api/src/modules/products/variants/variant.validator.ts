import { z } from "zod";

export const optionInputSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(100),
  values: z.array(z.string().min(1)).min(1),
  displayType: z.enum(["dropdown", "button", "color_swatch", "image_swatch"]).optional(),
  position: z.number().int().min(0).optional(),
});

export const variantInputSchema = z.object({
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

export const syncVariantsSchema = z.object({
  options: z.array(optionInputSchema).default([]),
  variants: z.array(variantInputSchema).default([]),
  productType: z.enum(["simple", "variable", "digital", "service", "downloadable"]).optional(),
});

export const bulkVariantSchema = z.object({
  variantIds: z.array(z.string()).min(1),
  action: z.enum(["update_price", "update_stock", "delete", "generate_sku", "generate_barcode"]),
  price: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  priceDelta: z.number().optional(),
  stockDelta: z.number().int().optional(),
});

export const optionTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  options: z.array(optionInputSchema).min(1),
});

export type OptionInput = z.infer<typeof optionInputSchema>;
export type VariantInput = z.infer<typeof variantInputSchema>;
export type SyncVariantsInput = z.infer<typeof syncVariantsSchema>;
export type BulkVariantInput = z.infer<typeof bulkVariantSchema>;
