import { z } from "zod";

const socialLinksSchema = z.object({
  facebook: z.string().max(500).optional(),
  instagram: z.string().max(500).optional(),
  x: z.string().max(500).optional(),
  linkedin: z.string().max(500).optional(),
  youtube: z.string().max(500).optional(),
});

export const updateEmailBrandingSchema = z.object({
  logo: z.string().max(2000).optional(),
  primaryColor: z.string().max(20).optional(),
  buttonColor: z.string().max(20).optional(),
  footer: z.string().max(2000).optional(),
  socialLinks: socialLinksSchema.optional(),
  website: z.string().max(500).optional(),
  supportEmail: z.union([z.literal(""), z.string().email().max(320)]).optional(),
  phone: z.string().max(40).optional(),
  address: z.string().max(500).optional(),
});

export type UpdateEmailBrandingInput = z.infer<typeof updateEmailBrandingSchema>;
