import { z } from "zod";

const socialLinksSchema = z.object({
  facebook: z.string().max(500).optional(),
  instagram: z.string().max(500).optional(),
  x: z.string().max(500).optional(),
  linkedin: z.string().max(500).optional(),
  youtube: z.string().max(500).optional(),
  telegram: z.string().max(500).optional(),
});

export const updateStoreContactSchema = z.object({
  businessName: z.string().max(200).optional(),
  email: z.union([z.literal(""), z.string().email().max(320)]).optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  postalCode: z.string().max(32).optional(),
  googleMapsEmbedUrl: z.string().max(2000).optional(),
  latitude: z.string().max(32).optional(),
  longitude: z.string().max(32).optional(),
  businessHours: z.string().max(2000).optional(),
  socialLinks: socialLinksSchema.optional(),
});

export type UpdateStoreContactInput = z.infer<typeof updateStoreContactSchema>;
