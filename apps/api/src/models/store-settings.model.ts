import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeSettingsSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, unique: true, index: true },
    currencyCode: { type: String, enum: ["USD", "BDT", "EUR", "GBP", "INR"], default: "USD" },
    currencySymbol: { type: String, default: "$" },
    currencyPosition: { type: String, enum: ["before", "after"], default: "before" },
    locale: { type: String, default: "en-US" },
    decimalPlaces: { type: Number, default: 2, min: 0, max: 4 },
    taxRate: { type: Number, default: 0, min: 0 },
    taxEnabled: { type: Boolean, default: false },
    taxIncluded: { type: Boolean, default: false },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

export type StoreSettingsDocument = InferSchemaType<typeof storeSettingsSchema>;
export const StoreSettingsModel = models.StoreSettings ?? model("StoreSettings", storeSettingsSchema);
