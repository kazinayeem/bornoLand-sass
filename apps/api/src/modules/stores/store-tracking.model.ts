import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const recentEventSchema = new Schema(
  {
    eventId: { type: String, required: true },
    eventName: { type: String, required: true },
    platform: { type: String, enum: ["meta", "tiktok", "all"], default: "all" },
    status: { type: String, enum: ["sent", "skipped", "error"], default: "sent" },
    payloadSummary: { type: Schema.Types.Mixed, default: () => ({}) },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const storeTrackingSettingsSchema = new Schema(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
      index: true,
    },
    metaPixel: {
      enabled: { type: Boolean, default: false },
      pixelId: { type: String, default: "", trim: true },
      advancedMatching: { type: Boolean, default: false },
      automaticEvents: { type: Boolean, default: true },
      testEventCode: { type: String, default: "", trim: true },
      lastVerifiedAt: { type: Date, default: null },
      status: {
        type: String,
        enum: ["not_configured", "connected", "active", "invalid", "disabled"],
        default: "not_configured",
      },
    },
    tiktokPixel: {
      enabled: { type: Boolean, default: false },
      pixelId: { type: String, default: "", trim: true },
      automaticEvents: { type: Boolean, default: true },
      testEventCode: { type: String, default: "", trim: true },
      lastVerifiedAt: { type: Date, default: null },
      status: {
        type: String,
        enum: ["not_configured", "connected", "active", "invalid", "disabled"],
        default: "not_configured",
      },
    },
    googleAnalytics: {
      enabled: { type: Boolean, default: false },
      measurementId: { type: String, default: "", trim: true },
    },
    customTracking: {
      enabled: { type: Boolean, default: false },
      headerScript: { type: String, default: "" },
      bodyScript: { type: String, default: "" },
    },
    recentEvents: {
      type: [recentEventSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export type StoreTrackingSettingsDocument = InferSchemaType<typeof storeTrackingSettingsSchema>;
export const StoreTrackingSettingsModel =
  models.StoreTrackingSettings ??
  model("StoreTrackingSettings", storeTrackingSettingsSchema);
