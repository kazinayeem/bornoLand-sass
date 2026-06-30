import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const planLimitsSchema = new Schema(
  {
    stores: { type: Number, default: 1 },
    products: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    categories: { type: Number, default: 0 },
    staff: { type: Number, default: 0 },
    storageGB: { type: Number, default: 0 },
    bandwidthGB: { type: Number, default: 0 },
    domains: { type: Number, default: 0 },
    themes: { type: Number, default: 0 },
    builderPages: { type: Number, default: 0 },
    apiAccess: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    coupons: { type: Boolean, default: false },
    reviews: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    customCode: { type: Boolean, default: false },
  },
  { _id: false }
);

const planPricingSchema = new Schema(
  {
    monthly: { type: Number, default: 0 },
    quarterly: { type: Number, default: 0 },
    halfYearly: { type: Number, default: 0 },
    yearly: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0 },
  },
  { _id: false }
);

const planSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    priceBDT: { type: Number, required: true, min: 0 },
    priceYearly: { type: Number, default: 0, min: 0 },
    isCustomPrice: { type: Boolean, default: false },
    trialDays: { type: Number, default: 0, min: 0 },
    features: { type: [String], default: [] },
    limits: { type: planLimitsSchema, default: () => ({}) },
    pricing: { type: planPricingSchema, default: () => ({}) },
    customDomain: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

planSchema.index({ slug: 1 }, { unique: true });

export type PlanDocument = InferSchemaType<typeof planSchema>;
export const PlanModel = models.Plan ?? model("Plan", planSchema);
