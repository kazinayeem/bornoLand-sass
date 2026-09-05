import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

export const NOTIFICATION_TYPES = [
  "new_order",
  "payment_received",
  "subscription_renewed",
  "storage_almost_full",
  "staff_invitation",
  "invoice_generated",
  "security_alert",
  "system_update",
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
  "contact_message",
  "hrm_alert",
  "hrm_leave_approved",
  "hrm_leave_rejected",
  "hrm_attendance_approved",
  "hrm_attendance_rejected",
  "hrm_bank_approved",
  "hrm_bank_rejected",
  "hrm_document_added",
  "hrm_task_assigned",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES, index: true },
    isRead: { type: Boolean, default: false, index: true },
    actionUrl: { type: String, default: "", trim: true, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = models.Notification ?? model("Notification", notificationSchema);
