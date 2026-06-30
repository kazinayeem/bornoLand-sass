import { z } from "zod";
import { SUBSCRIPTION_DURATIONS } from "../subscriptions/subscription.constants.js";

const planLimitsSchema = z.object({
  stores: z.number().min(0).optional().default(1),
  products: z.number().min(0).optional().default(0),
  orders: z.number().min(0).optional().default(0),
  categories: z.number().min(0).optional().default(0),
  staff: z.number().min(0).optional().default(0),
  storageGB: z.number().min(0).optional().default(0),
  bandwidthGB: z.number().min(0).optional().default(0),
  domains: z.number().min(0).optional().default(0),
  themes: z.number().min(0).optional().default(0),
  builderPages: z.number().min(0).optional().default(0),
  apiAccess: z.boolean().optional().default(false),
  analytics: z.boolean().optional().default(false),
  coupons: z.boolean().optional().default(false),
  reviews: z.boolean().optional().default(false),
  marketing: z.boolean().optional().default(false),
  customCode: z.boolean().optional().default(false),
});

const planPricingSchema = z.object({
  monthly: z.number().min(0).optional().default(0),
  quarterly: z.number().min(0).optional().default(0),
  halfYearly: z.number().min(0).optional().default(0),
  yearly: z.number().min(0).optional().default(0),
  lifetime: z.number().min(0).optional().default(0),
});

export const planSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional().default(""),
  priceBDT: z.number().min(0),
  priceYearly: z.number().min(0).optional().default(0),
  isCustomPrice: z.boolean().optional().default(false),
  trialDays: z.number().min(0).optional().default(0),
  features: z.array(z.string().min(1)).optional().default([]),
  limits: planLimitsSchema.optional().default({
    stores: 1,
    products: 0,
    orders: 0,
    categories: 0,
    staff: 0,
    storageGB: 0,
    bandwidthGB: 0,
    domains: 0,
    themes: 0,
    builderPages: 0,
    apiAccess: false,
    analytics: false,
    coupons: false,
    reviews: false,
    marketing: false,
    customCode: false,
  }),
  pricing: planPricingSchema.optional().default({
    monthly: 0,
    quarterly: 0,
    halfYearly: 0,
    yearly: 0,
    lifetime: 0,
  }),
  customDomain: z.boolean().optional().default(false),
  prioritySupport: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
  visible: z.boolean().optional().default(true),
  isRecommended: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

export const updatePlanSchema = planSchema.partial().extend({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens").optional(),
});

export type PlanInput = z.infer<typeof planSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;

export const planDurationSchema = z.enum(SUBSCRIPTION_DURATIONS);
