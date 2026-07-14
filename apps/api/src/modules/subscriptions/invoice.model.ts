import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const timelineEventSchema = new Schema(
  {
    event: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
  },
  { _id: false }
);

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
    discount: { type: Number, default: 0, min: 0 },
    vatAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },

    status: {
      type: String,
      enum: ["paid", "pending", "rejected", "refunded"],
      default: "paid",
      index: true,
    },

    gateway: { type: String, default: "" },
    transactionId: { type: String, default: "", trim: true },
    senderNumber: { type: String, default: "", trim: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },

    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
    dueDate: { type: Date },
    billingPeriodStart: { type: Date },
    billingPeriodEnd: { type: Date },

    companyName: { type: String, default: "BornoLand" },
    companyLogo: { type: String, default: "" },
    companyAddress: { type: String, default: "" },
    companyPhone: { type: String, default: "" },
    companyEmail: { type: String, default: "" },
    companyWebsite: { type: String, default: "" },
    companyTaxId: { type: String, default: "" },

    pdfUrl: { type: String, default: "" },

    timeline: [timelineEventSchema],

    verificationCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ storeId: 1, createdAt: -1 });
invoiceSchema.index({ invoiceNumber: 1 });

export type InvoiceDocument = InferSchemaType<typeof invoiceSchema>;
export const InvoiceModel = models.Invoice ?? model("Invoice", invoiceSchema);

// ─── Counter for sequential numbering ────────────────────────────────────────

const invoiceCounterSchema = new Schema(
  {
    year: { type: Number, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type InvoiceCounterDocument = InferSchemaType<typeof invoiceCounterSchema>;
export const InvoiceCounterModel =
  models.InvoiceCounter ?? model("InvoiceCounter", invoiceCounterSchema);
