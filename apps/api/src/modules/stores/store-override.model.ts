import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeOverrideSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true },

    // Plan override — if set, store uses this plan instead of the one on the Store doc
    planId: { type: Schema.Types.ObjectId, ref: "Plan" },

    // Numeric limit overrides: keys match PlanModel limits keys, e.g. { products: 500, storage: 2048 }
    // null = use plan default
    limits: { type: Schema.Types.Mixed, default: {} },

    // Boolean feature override: keys match PlanModel featureToggles keys, e.g. { productVariants: true }
    // null = use plan default
    featureOverrides: { type: Schema.Types.Mixed, default: {} },

    // Storage-specific overrides
    storageOverrideMB: { type: Number },
    storageUnlimited: { type: Boolean, default: false },

    // Trial overrides
    trialEnabled: { type: Boolean },
    trialEndsAt: { type: Date },
    trialStartedAt: { type: Date },

    // Subscription overrides
    subscriptionStatusOverride: {
      type: String,
      enum: ["active", "paused", "suspended", "cancelled", "expired", null],
    },
    billingStatusOverride: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled", "paused", null],
    },
    subscriptionExpiresAt: { type: Date },

    // Maintenance / soft-block
    maintenanceMode: { type: Boolean },
    loginDisabled: { type: Boolean },

    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type StoreOverrideDocument = InferSchemaType<typeof storeOverrideSchema>;
export const StoreOverrideModel =
  models.StoreOverride ?? model("StoreOverride", storeOverrideSchema);
