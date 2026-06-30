import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const invoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, trim: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: "StoreSubscription" },
    paymentId: { type: Schema.Types.ObjectId, ref: "SubscriptionPayment" },
    duration: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly", "lifetime"],
      default: "monthly",
    },
    subtotal: { type: Number, required: true, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    status: { type: String, enum: ["paid", "void"], default: "paid" },
    paidAt: { type: Date, default: Date.now },
    companyName: { type: String, default: "" },
    companyLogo: { type: String, default: "" },
  },
  { timestamps: true }
);

export type InvoiceDocument = InferSchemaType<typeof invoiceSchema>;
export const InvoiceModel = models.Invoice ?? model("Invoice", invoiceSchema);
