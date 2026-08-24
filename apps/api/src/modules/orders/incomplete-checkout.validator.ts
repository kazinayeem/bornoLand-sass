import { z } from "zod";

export const trackCheckoutProgressSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  customerId: z.string().optional().nullable(),
  customerName: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  street: z.string().trim().optional().default(""),
  apartment: z.string().trim().optional().default(""),
  city: z.string().trim().optional().default(""),
  area: z.string().trim().optional().default(""),
  state: z.string().trim().optional().default(""),
  zip: z.string().trim().optional().default(""),
  country: z.string().trim().optional().default("Bangladesh"),
  landmark: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
  step: z.string().optional().default("customer_info"),

  items: z
    .array(
      z.object({
        productId: z.any(),
        variantId: z.any().optional().nullable(),
        variantTitle: z.string().optional().default(""),
        name: z.string(),
        price: z.number().min(0),
        quantity: z.number().min(1),
        image: z.string().optional().default(""),
        sku: z.string().optional().default(""),
      })
    )
    .optional()
    .default([]),

  subtotal: z.number().optional().default(0),
  discount: z.number().optional().default(0),
  shippingFee: z.number().optional().default(0),
  tax: z.number().optional().default(0),
  total: z.number().optional().default(0),

  couponCode: z.string().trim().optional().default(""),
  deliveryZoneId: z.string().optional().default(""),
  deliveryZoneName: z.string().optional().default(""),
  shippingMethod: z.string().optional().default(""),
  paymentMethod: z.string().optional().default("cod"),
});

export const queryIncompleteCheckoutsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  status: z.enum(["all", "in_progress", "abandoned", "recovered", "converted", "expired"]).optional().default("all"),
  from: z.string().optional(),
  to: z.string().optional(),
  minTotal: z.string().optional(),
  maxTotal: z.string().optional(),
  preset: z.enum(["today", "yesterday", "7d", "30d", "month", "all", "custom"]).optional(),
});

export type TrackCheckoutProgressInput = z.infer<typeof trackCheckoutProgressSchema>;
export type QueryIncompleteCheckoutsInput = z.infer<typeof queryIncompleteCheckoutsSchema>;
