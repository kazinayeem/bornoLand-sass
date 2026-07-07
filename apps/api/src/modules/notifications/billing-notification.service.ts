import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { BillingNotificationModel } from "./billing-notification.model.js";
import type { BillingNotificationType } from "../subscriptions/subscription.constants.js";

export async function createBillingNotification(input: {
  userId: string;
  storeId?: string;
  type: BillingNotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}, session?: mongoose.ClientSession) {
  await connectDatabase();
  const createOptions = session ? { session } : {};
  const [notification] = await BillingNotificationModel.create([{
    userId: input.userId,
    storeId: input.storeId,
    type: input.type,
    title: input.title,
    message: input.message,
    metadata: input.metadata ?? {},
  }], createOptions);
  return notification.toObject();
}

export async function listUserNotifications(userId: string, limit = 50) {
  await connectDatabase();
  const notifications = await BillingNotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return { ok: true as const, data: { notifications } };
}

export async function markNotificationRead(notificationId: string, userId: string) {
  await connectDatabase();
  const notification = await BillingNotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  ).lean();
  if (!notification) return { ok: false as const, message: "Notification not found" };
  return { ok: true as const, data: { notification } };
}

export async function markAllNotificationsRead(userId: string) {
  await connectDatabase();
  await BillingNotificationModel.updateMany({ userId, read: false }, { $set: { read: true } });
  return { ok: true as const };
}

export async function getUnreadNotificationCount(userId: string) {
  await connectDatabase();
  const count = await BillingNotificationModel.countDocuments({ userId, read: false });
  return { ok: true as const, data: { count } };
}
