import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const subscriptionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    provider: { type: String, enum: ["stripe", "sslcommerz"], required: true },
    plan: { type: String, enum: ["free", "starter", "growth", "enterprise"], required: true },
    status: { type: String, enum: ["trialing", "active", "past_due", "canceled"], default: "trialing" },
    externalCustomerId: { type: String, index: true },
    externalSubscriptionId: { type: String, index: true },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  { timestamps: true, collection: "subscriptions" }
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;

export const SubscriptionModel = models.Subscription ?? model("Subscription", subscriptionSchema);
