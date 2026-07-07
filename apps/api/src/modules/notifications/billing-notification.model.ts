import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const billingNotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    type: {
      type: String,
      enum: [
        "trial_started",
        "trial_ending",
        "trial_ending_soon_7",
        "trial_ending_soon_3",
        "trial_expired",
        "payment_submitted",
        "payment_approved",
        "payment_rejected",
        "subscription_expiring",
        "subscription_expired",
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type BillingNotificationDocument = InferSchemaType<typeof billingNotificationSchema>;
export const BillingNotificationModel =
  models.BillingNotification ?? model("BillingNotification", billingNotificationSchema);
