import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const platformSettingsSchema = new Schema(
  {
    key: { type: String, unique: true, default: "global" },
    platformName: { type: String, default: "BornoLand" },
    platformLogo: { type: String, default: "" },
    companyName: { type: String, default: "BornoLand" },
    supportEmail: { type: String, default: "" },
    supportPhone: { type: String, default: "" },
    currencyCode: { type: String, default: "BDT" },
    currencySymbol: { type: String, default: "৳" },
    currencyPosition: { type: String, enum: ["before", "after"], default: "before" },
    platformFeePercent: { type: Number, default: 0, min: 0, max: 100 },
    vatPercent: { type: Number, default: 0, min: 0, max: 100 },
    taxPercent: { type: Number, default: 0, min: 0, max: 100 },
    trialEnabled: { type: Boolean, default: true },
    trialDays: { type: Number, default: 3, min: 0 },
    defaultPlanSlug: { type: String, default: "free" },
    timezone: { type: String, default: "Asia/Dhaka" },
    maintenanceMode: { type: Boolean, default: false },
    invoicePrefix: { type: String, default: "INV-" },
    invoiceLogo: { type: String, default: "" },
    enabledDurations: {
      monthly: { type: Boolean, default: true },
      quarterly: { type: Boolean, default: true },
      halfYearly: { type: Boolean, default: true },
      yearly: { type: Boolean, default: true },
      lifetime: { type: Boolean, default: false },
    },
    enabledPaymentMethods: {
      bkash: { type: Boolean, default: true },
      nagad: { type: Boolean, default: true },
      cod: { type: Boolean, default: true },
    },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: "" },
    smtpPass: { type: String, default: "" },
    smtpFromEmail: { type: String, default: "" },
    smtpFromName: { type: String, default: "" },
  },
  { timestamps: true }
);

export type PlatformSettingsDocument = InferSchemaType<typeof platformSettingsSchema>;
export const PlatformSettingsModel = models.PlatformSettings ?? model("PlatformSettings", platformSettingsSchema);
