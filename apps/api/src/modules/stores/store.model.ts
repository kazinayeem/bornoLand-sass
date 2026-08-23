import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    subdomain: { type: String, unique: true, lowercase: true, trim: true },
    /** Customer-mapped hostnames (e.g. www.shop.com) — DB is source of truth for custom domains */
    customDomains: {
      type: [{ type: String, lowercase: true, trim: true }],
      default: [],
      index: true,
    },
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "general", trim: true },
    storeType: {
      type: String,
      enum: [
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
      ],
      default: "ecommerce",
    },
    plan: { type: String, enum: ["free", "starter", "growth", "business", "enterprise"], default: "free" },
    planId: { type: Schema.Types.ObjectId, ref: "Plan" },
    subscriptionDuration: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly", "lifetime"],
      default: "monthly",
    },
    subscriptionStartDate: { type: Date },
    billingStatus: { type: String, enum: ["trial", "active", "past_due", "cancelled", "paused"], default: "trial" },
    subscriptionStatus: { type: String, enum: ["trialing", "active", "past_due", "cancelled", "paused"], default: "trialing" },
    renewalDate: { type: Date },
    trialStartedAt: { type: Date },
    trialEndsAt: { type: Date },
    published: { type: Boolean, default: true },
    allowNewOrders: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "suspended", "draft", "archived", "expired", "pending_payment", "pending_approval"],
      default: "active",
    },
    archivedAt: { type: Date },
    shortName: { type: String, default: "", trim: true },
    tagline: { type: String, default: "", trim: true },
    logoUrl: { type: String, default: "" },
    logoMediaId: { type: Schema.Types.ObjectId, ref: "MediaFile", default: null },
    faviconUrl: { type: String, default: "" },
    faviconMediaId: { type: Schema.Types.ObjectId, ref: "MediaFile", default: null },
    brandColor: { type: String, default: "#2563eb" },
    accentColor: { type: String, default: "#0f172a" },
    theme: {
      themeId: { type: String, default: "grocery", trim: true },
      primaryColor: { type: String, default: "#2563eb" },
      secondaryColor: { type: String, default: "#0f172a" },
      font: { type: String, default: "Inter" },
      buttonStyle: { type: String, default: "rounded-lg" },
      layoutWidth: { type: String, default: "1200px" },
      darkMode: { type: Boolean, default: false },
      navbarStyle: { type: String, default: "fixed" }
    },
    headerSettings: { type: Schema.Types.Mixed, default: () => ({}) },
    footerSettings: { type: Schema.Types.Mixed, default: () => ({}) },
    design: { type: Schema.Types.Mixed, default: () => ({}) },
    storageUsedBytes: { type: Number, default: 0, min: 0 },
    storageLimitBytes: { type: Number, default: 0, min: 0 },
    storageUpdatedAt: { type: Date },
    courierAccess: {
      providers: { type: [{ type: String, lowercase: true, trim: true }], default: [] },
    },
  },
  { timestamps: true }
);

storeSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
storeSchema.index({ userId: 1, createdAt: -1 });
storeSchema.index({ status: 1, billingStatus: 1 });
storeSchema.index({ tenantId: 1 });
storeSchema.index({ name: "text", description: "text", tagline: "text" });

export type StoreDocument = InferSchemaType<typeof storeSchema>;
export const StoreModel = models.Store ?? model("Store", storeSchema);
