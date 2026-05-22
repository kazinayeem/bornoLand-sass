import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional().default(""),
  category: z.string().max(50).optional().default("general"),
  plan: z.enum(["free", "starter", "growth", "enterprise"]).optional().default("free")
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  plan: z.enum(["free", "starter", "growth", "enterprise"]).optional(),
  status: z.enum(["active", "suspended", "draft"]).optional()
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
