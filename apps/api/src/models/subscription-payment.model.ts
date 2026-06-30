import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const subscriptionPaymentSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    paymentMethod: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "bank"],
      required: true,
    },
    senderNumber: { type: String, required: true, trim: true },
    transactionId: { type: String, required: true, trim: true },
    screenshotUrl: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
      index: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    rejectedReason: { type: String, default: "" },
    subscriptionExpireDate: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export type SubscriptionPaymentDocument = InferSchemaType<typeof subscriptionPaymentSchema>;
export const SubscriptionPaymentModel =
  models.SubscriptionPayment ?? model("SubscriptionPayment", subscriptionPaymentSchema);
