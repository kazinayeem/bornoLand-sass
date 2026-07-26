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
    orderPrefix: { type: String, default: "ORD" },
    invoicePrefix: { type: String, default: "INV" },
    lowStockAlertEnabled: { type: Boolean, default: true },
    /** Global min quantity override for low-stock alerts (null = use product thresholds) */
    lowStockMinQuantity: { type: Number, default: null, min: 0 },
    lowStockAlertEmail: { type: String, default: "", trim: true },
    lowStockNotifyOwner: { type: Boolean, default: true },
    dateFormat: { type: String, default: "MM/DD/YYYY" },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },
    // Shipping
    shippingEnabled: { type: Boolean, default: true },
    freeShippingEnabled: { type: Boolean, default: false },
    freeShippingMin: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type StoreSettingsDocument = InferSchemaType<typeof storeSettingsSchema>;
export const StoreSettingsModel = models.StoreSettings ?? model("StoreSettings", storeSettingsSchema);
