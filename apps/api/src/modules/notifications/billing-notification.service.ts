import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { NotificationModel } from "./notification.model.js";
import type { BillingNotificationType } from "../subscriptions/subscription.constants.js";

export async function createBillingNotification(input: {
  userId: string;
  storeId?: string;
  type: BillingNotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
}, session?: mongoose.ClientSession) {
  await connectDatabase();
  const createOptions = session ? { session } : {};
  const [notification] = await NotificationModel.create([{
    userId: input.userId,
    storeId: input.storeId,
    type: input.type,
    title: input.title,
    message: input.message,
    metadata: input.metadata ?? {},
    actionUrl: input.actionUrl ?? "",
  }], createOptions);
  return notification.toObject();
}

function serializeNotification(notification: Record<string, unknown>) {
  return {
    ...notification,
    id: String(notification._id),
    _id: String(notification._id),
    userId: String(notification.userId),
    storeId: notification.storeId ? String(notification.storeId) : null,
    read: Boolean(notification.isRead),
  };
}

export async function listUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
  await connectDatabase();
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const filter = { userId, ...(unreadOnly ? { isRead: false } : {}) };
  const [notifications, total, unreadCount] = await Promise.all([
    NotificationModel.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit).lean(),
    NotificationModel.countDocuments(filter),
    NotificationModel.countDocuments({ userId, isRead: false }),
  ]);
  return {
    ok: true as const,
    data: {
      notifications: notifications.map((item) => serializeNotification(item as Record<string, unknown>)),
      unreadCount,
      pagination: { page: safePage, limit: safeLimit, total, pages: Math.max(1, Math.ceil(total / safeLimit)) },
    },
  };
}

export async function markNotificationRead(notificationId: string, userId: string) {
  await connectDatabase();
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  ).lean();
  if (!notification) return { ok: false as const, message: "Notification not found" };
  return { ok: true as const, data: { notification: serializeNotification(notification as Record<string, unknown>) } };
}

export async function markAllNotificationsRead(userId: string) {
  await connectDatabase();
  await NotificationModel.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  return { ok: true as const };
}

export async function getUnreadNotificationCount(userId: string) {
  await connectDatabase();
  const count = await NotificationModel.countDocuments({ userId, isRead: false });
  return { ok: true as const, data: { count } };
}

export async function deleteNotification(notificationId: string, userId: string) {
  await connectDatabase();
  const notification = await NotificationModel.findOneAndDelete({ _id: notificationId, userId });
  if (!notification) return { ok: false as const, message: "Notification not found" };
  return { ok: true as const };
}

export async function clearNotifications(userId: string) {
  await connectDatabase();
  const result = await NotificationModel.deleteMany({ userId });
  return { ok: true as const, data: { deletedCount: result.deletedCount } };
}
