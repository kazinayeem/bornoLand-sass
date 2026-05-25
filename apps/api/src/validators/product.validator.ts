import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(5000).optional().default(""),
  price: z.number().min(0),
  comparePrice: z.number().min(0).optional(),
  category: z.string().max(100).optional().default("general"),
  stock: z.number().int().min(0).optional().default(0),
  status: z.enum(["active", "inactive"]).optional().default("active"),
  sku: z.string().max(100).optional().default(""),
  imageUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  galleryImageUrls: z.array(z.string().url()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false)
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).optional(),
  comparePrice: z.number().min(0).optional(),
  category: z.string().max(100).optional(),
  stock: z.number().int().min(0).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sku: z.string().max(100).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  galleryImageUrls: z.array(z.string().url()).optional(),
  images: z.array(z.string()).optional(),
  featured: z.boolean().optional()
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
