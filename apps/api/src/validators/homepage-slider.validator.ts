import { z } from "zod";

export const createHomepageSliderSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional().default(""),
  imageUrl: z.string().url(),
  buttonText: z.string().max(50).optional().default("Shop Now"),
  buttonLink: z.string().max(200).optional().default("/shop"),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  overlayColor: z.string().max(64).optional().default("rgba(15, 23, 42, 0.45)"),
  textAlignment: z.enum(["left", "center", "right"]).optional().default("left")
});

export const updateHomepageSliderSchema = createHomepageSliderSchema.partial();

export type CreateHomepageSliderInput = z.infer<typeof createHomepageSliderSchema>;
export type UpdateHomepageSliderInput = z.infer<typeof updateHomepageSliderSchema>;