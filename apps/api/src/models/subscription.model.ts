import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const subscriptionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", index: true, required: true },
    provider: { type: String, enum: ["stripe", "sslcommerz"], required: true },
    externalSubscriptionId: { type: String, index: true },
    plan: { type: String, enum: ["free", "starter", "growth", "enterprise"], required: true },
    status: { type: String, enum: ["active", "past_due", "canceled", "trialing"], default: "trialing" },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;

export const SubscriptionModel = models.Subscription ?? model("Subscription", subscriptionSchema);