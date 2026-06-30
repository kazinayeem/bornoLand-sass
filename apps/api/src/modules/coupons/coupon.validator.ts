import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/, "Code must be alphanumeric"),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]).default("percentage"),
  value: z.number().min(0).optional().default(0),
  buyQuantity: z.number().int().min(0).optional().default(0),
  getQuantity: z.number().int().min(0).optional().default(0),
  minimumOrderAmount: z.number().min(0).optional().default(0),
  maximumDiscount: z.number().min(0).optional().default(0),
  firstOrderOnly: z.boolean().optional().default(false),
  customerIds: z.array(z.string()).optional().default([]),
  productIds: z.array(z.string()).optional().default([]),
  categoryIds: z.array(z.string()).optional().default([]),
  usageLimit: z.number().int().min(0).optional().default(0),
  usagePerCustomer: z.number().int().min(0).optional().default(0),
  startsAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  autoApply: z.boolean().optional().default(false),
  status: z.enum(["draft", "active", "expired"]).optional().default("draft"),
});

export const updateCouponSchema = createCouponSchema.partial();

export const applyCouponSchema = z.object({
  code: z.string().min(1).max(50),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
