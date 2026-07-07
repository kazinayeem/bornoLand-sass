import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const storeSubscriptionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    duration: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly", "lifetime"],
      default: "monthly",
    },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "BDT" },
    status: {
      type: String,
      enum: ["trial", "pending_payment", "pending_approval", "active", "expired", "suspended", "cancelled"],
      default: "trial",
      index: true,
    },
    isTrial: { type: Boolean, default: false },
    startDate: { type: Date },
    expireDate: { type: Date, index: true },
    renewDate: { type: Date },
    paymentId: { type: Schema.Types.ObjectId, ref: "SubscriptionPayment" },
  },
  { timestamps: true }
);

storeSubscriptionSchema.index({ storeId: 1, status: 1 });
storeSubscriptionSchema.index({ storeId: 1, status: 1, createdAt: -1 });

export type StoreSubscriptionDocument = InferSchemaType<typeof storeSubscriptionSchema>;
export const StoreSubscriptionModel =
  models.StoreSubscription ?? model("StoreSubscription", storeSubscriptionSchema);
