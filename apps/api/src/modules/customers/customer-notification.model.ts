import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

export const CUSTOMER_NOTIFICATION_TYPES = [
  "order",
  "payment",
  "shipping",
  "security",
  "promotion",
  "system",
  "wishlist",
  "review",
  "coupon",
] as const;

export const CUSTOMER_NOTIFICATION_PRIORITIES = ["low", "medium", "high"] as const;

export type CustomerNotificationType = (typeof CUSTOMER_NOTIFICATION_TYPES)[number];
export type CustomerNotificationPriority = (typeof CUSTOMER_NOTIFICATION_PRIORITIES)[number];

const customerNotificationSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 1200 },
    type: { type: String, enum: CUSTOMER_NOTIFICATION_TYPES, required: true, index: true },
    icon: { type: String, default: "", trim: true, maxlength: 50 },
    link: { type: String, default: "", trim: true, maxlength: 500 },
    priority: { type: String, enum: CUSTOMER_NOTIFICATION_PRIORITIES, default: "medium", index: true },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

customerNotificationSchema.index({ customerId: 1, createdAt: -1 });
customerNotificationSchema.index({ customerId: 1, read: 1, createdAt: -1 });
customerNotificationSchema.index({ customerId: 1, type: 1, createdAt: -1 });

export type CustomerNotificationDocument = InferSchemaType<typeof customerNotificationSchema>;
export const CustomerNotificationModel =
  models.CustomerNotification ?? model("CustomerNotification", customerNotificationSchema);
