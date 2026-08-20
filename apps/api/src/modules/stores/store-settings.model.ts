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

    // Checkout Settings
    guestCheckoutEnabled: { type: Boolean, default: true },
    requireLoginEnabled: { type: Boolean, default: false },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },

    // Payment Methods Configuration
    paymentSettings: {
      codEnabled: { type: Boolean, default: true },
      bkash: {
        enabled: { type: Boolean, default: false },
        number: { type: String, default: "" },
        type: { type: String, enum: ["personal", "merchant"], default: "personal" },
        instructions: { type: String, default: "Send money to shop bKash number and enter TrxID below." },
      },
      nagad: {
        enabled: { type: Boolean, default: false },
        number: { type: String, default: "" },
        type: { type: String, enum: ["personal", "merchant"], default: "personal" },
        instructions: { type: String, default: "Send money to shop Nagad number and enter TrxID below." },
      },
    },

    // Configured Delivery Zones
    deliveryZones: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        charge: { type: Number, required: true, min: 0 },
        estimatedDays: { type: String, default: "2-3 Days" },
        enabled: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

export type StoreSettingsDocument = InferSchemaType<typeof storeSettingsSchema>;
export const StoreSettingsModel = models.StoreSettings ?? model("StoreSettings", storeSettingsSchema);
