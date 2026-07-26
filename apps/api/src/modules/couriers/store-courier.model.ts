import mongoose, { type InferSchemaType } from "mongoose";
import { COURIER_PROVIDER_SLUGS } from "./courier.constants.js";

const { Schema, model, models } = mongoose;

const shipmentSettingsSchema = new Schema(
  {
    autoCreateShipment: { type: Boolean, default: false },
    autoSyncTracking: { type: Boolean, default: false },
    autoRefreshTracking: {
      type: String,
      enum: ["5", "15", "30", "manual"],
      default: "manual",
    },
    codEnabled: { type: Boolean, default: true },
    defaultWeightKg: { type: Number, default: 0.5, min: 0 },
    defaultDeliveryType: { type: String, default: "standard", trim: true },
  },
  { _id: false },
);

const storeCourierSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    provider: {
      type: String,
      enum: COURIER_PROVIDER_SLUGS,
      required: true,
      lowercase: true,
      trim: true,
    },
    enabled: { type: Boolean, default: false },
    sandbox: { type: Boolean, default: true },
    /** AES-GCM encrypted JSON blob of credentials — never returned to clients */
    credentialsEncrypted: { type: String, default: "" },
    /** Which credential keys are set (for UI masks) */
    credentialKeysSet: { type: [String], default: [] },
    connectionStatus: {
      type: String,
      enum: ["connected", "not_connected", "error"],
      default: "not_connected",
    },
    lastTestedAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
    shipmentSettings: { type: shipmentSettingsSchema, default: () => ({}) },
  },
  { timestamps: true },
);

storeCourierSchema.index({ storeId: 1, provider: 1 }, { unique: true });

export type StoreCourierDocument = InferSchemaType<typeof storeCourierSchema>;
export const StoreCourierModel =
  models.StoreCourier ?? model("StoreCourier", storeCourierSchema);
