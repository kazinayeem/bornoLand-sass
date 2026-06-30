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
  shortName: z.string().max(24).optional(),
  tagline: z.string().max(120).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional().default(""),
  category: z.string().max(50).optional().default("ecommerce"),
  storeType: z
    .enum([
      "ecommerce",
      "portfolio",
      "lms",
      "agency",
      "restaurant",
      "booking",
      "digital_products",
      "real_estate",
      "blog",
      "hospital",
      "school",
      "marketplace",
    ])
    .optional()
    .default("ecommerce"),
  plan: z.enum(["free", "starter", "growth", "enterprise"]).optional().default("free"),
  planId: z.string().optional(),
  selectedTemplateId: z.string().optional(),
  logoUrl: z.string().optional(),
  logoMediaId: z.string().optional(),
  faviconUrl: z.string().optional(),
  faviconMediaId: z.string().optional(),
  brandColor: z.string().optional(),
  accentColor: z.string().optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  shortName: z.string().max(24).optional(),
  tagline: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  plan: z.enum(["free", "starter", "growth", "enterprise"]).optional(),
  planId: z.string().optional(),
  billingStatus: z.enum(["trial", "active", "past_due", "cancelled", "paused"]).optional(),
  subscriptionStatus: z.enum(["trialing", "active", "past_due", "cancelled", "paused"]).optional(),
  renewalDate: z.string().datetime().optional(),
  status: z.enum(["active", "suspended", "draft", "archived", "expired", "pending_payment", "pending_approval"]).optional(),
  logoUrl: z.string().optional(),
  logoMediaId: z.string().nullable().optional(),
  faviconUrl: z.string().optional(),
  faviconMediaId: z.string().nullable().optional(),
  brandColor: z.string().optional(),
  accentColor: z.string().optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
  selectedTemplateId: z.string().optional(),
  theme: themeSchema.optional()
});

export const updateStoreBrandingSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  shortName: z.string().max(24).optional(),
  tagline: z.string().max(120).optional(),
  logoUrl: z.string().optional(),
  logoMediaId: z.string().nullable().optional(),
  faviconUrl: z.string().optional(),
  faviconMediaId: z.string().nullable().optional(),
  brandColor: z.string().optional(),
  accentColor: z.string().optional(),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type UpdateStoreBrandingInput = z.infer<typeof updateStoreBrandingSchema>;
