import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeUsageSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true },
    products: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    monthlyOrders: { type: Number, default: 0 },
    customers: { type: Number, default: 0 },
    categories: { type: Number, default: 0 },
    pages: { type: Number, default: 0 },
    blogs: { type: Number, default: 0 },
    staff: { type: Number, default: 0 },
    media: { type: Number, default: 0 },
    storageMB: { type: Number, default: 0 },
    bandwidthMB: { type: Number, default: 0 },
    domains: { type: Number, default: 0 },
    templates: { type: Number, default: 0 },
    coupons: { type: Number, default: 0 },
    discountRules: { type: Number, default: 0 },
    reports: { type: Number, default: 0 },
    apiRequests: { type: Number, default: 0 },
    aiCredits: { type: Number, default: 0 },
    automationRules: { type: Number, default: 0 },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type StoreUsageDocument = InferSchemaType<typeof storeUsageSchema>;
export const StoreUsageModel = models.StoreUsage ?? model("StoreUsage", storeUsageSchema);
