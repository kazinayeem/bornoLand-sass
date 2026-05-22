import { z } from "zod";

const themeSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  font: z.string().optional(),
  buttonStyle: z.string().optional(),
  layoutWidth: z.string().optional(),
  darkMode: z.boolean().optional(),
  navbarStyle: z.string().optional()
});

export const createStoreSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional().default(""),
  category: z.string().max(50).optional().default("general"),
  plan: z.enum(["free", "starter", "growth", "enterprise"]).optional().default("free"),
  selectedTemplateId: z.string().optional(),
  logoUrl: z.string().optional()
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  plan: z.enum(["free", "starter", "growth", "enterprise"]).optional(),
  status: z.enum(["active", "suspended", "draft"]).optional(),
  logoUrl: z.string().optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  selectedTemplateId: z.string().optional(),
  theme: themeSchema.optional()
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
