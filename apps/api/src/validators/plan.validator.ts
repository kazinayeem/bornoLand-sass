import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  priceBDT: z.number().min(0),
  trialDays: z.number().min(0).optional().default(0),
  features: z.array(z.string().min(1)).optional().default([]),
  limits: z.object({
    stores: z.number().min(0).optional().default(1),
    products: z.number().min(0).optional().default(0),
    staff: z.number().min(0).optional().default(0),
    bandwidthGB: z.number().min(0).optional().default(0)
  }).optional().default({ stores: 1, products: 0, staff: 0, bandwidthGB: 0 }),
  isRecommended: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
});

export const updatePlanSchema = planSchema.partial().extend({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional()
});

export type PlanInput = z.infer<typeof planSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;