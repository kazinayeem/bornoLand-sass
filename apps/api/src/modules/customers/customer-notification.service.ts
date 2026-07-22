import { connectDatabase } from "../../common/database/connection.js";
import {
  CustomerNotificationModel,
  type CustomerNotificationPriority,
  type CustomerNotificationType,
} from "./customer-notification.model.js";

type ListOptions = {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
  search?: string;
};

function serializeNotification(item: Record<string, unknown>) {
  return {
    ...item,
    _id: String(item._id),
    id: String(item._id),
    customerId: String(item.customerId),
    storeId: String(item.storeId),
    read: Boolean(item.read),
  };
}

export async function createCustomerNotification(input: {
  customerId: string;
  storeId: string;
  title: string;
  message: string;
  type: CustomerNotificationType;
  icon?: string;
  link?: string;
  priority?: CustomerNotificationPriority;
  metadata?: Record<string, unknown>;
}) {
  await connectDatabase();
  const notification = await CustomerNotificationModel.create({
    customerId: input.customerId,
    storeId: input.storeId,
    title: input.title,
    message: input.message,
    type: input.type,
    icon: input.icon ?? "",
    link: input.link ?? "",
    priority: input.priority ?? "medium",
    metadata: input.metadata ?? {},
  });
  return { ok: true as const, data: { notification: serializeNotification(notification.toObject() as Record<string, unknown>) } };
}

export async function listCustomerNotifications(customerId: string, storeId: string, options: ListOptions = {}) {
  await connectDatabase();
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 20));
  const filter: Record<string, unknown> = { customerId, storeId };
  if (options.unreadOnly) filter.read = false;
  if (options.type && options.type !== "all") filter.type = options.type;
  if (options.search?.trim()) {
    const q = options.search.trim();
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }
  const [items, total, unreadCount] = await Promise.all([
    CustomerNotificationModel.find(filter)
      .sort({ read: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CustomerNotificationModel.countDocuments(filter),
    CustomerNotificationModel.countDocuments({ customerId, storeId, read: false }),
  ]);
  return {
    ok: true as const,
    data: {
      notifications: items.map((item) => serializeNotification(item as unknown as Record<string, unknown>)),
      unreadCount,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    },
  };
}

export async function markCustomerNotificationRead(customerId: string, storeId: string, id: string) {
  await connectDatabase();
  const notification = await CustomerNotificationModel.findOneAndUpdate(
    { _id: id, customerId, storeId },
    { $set: { read: true } },
    { new: true },
  ).lean();
  if (!notification) return { ok: false as const, message: "Notification not found" };
  return { ok: true as const, data: { notification: serializeNotification(notification as unknown as Record<string, unknown>) } };
}

export async function markAllCustomerNotificationsRead(customerId: string, storeId: string) {
  await connectDatabase();
  await CustomerNotificationModel.updateMany({ customerId, storeId, read: false }, { $set: { read: true } });
  return { ok: true as const };
}

export async function deleteCustomerNotification(customerId: string, storeId: string, id: string) {
  await connectDatabase();
  const existing = await CustomerNotificationModel.findOneAndDelete({ _id: id, customerId, storeId }).lean();
  if (!existing) return { ok: false as const, message: "Notification not found" };
  return { ok: true as const };
}

export async function getCustomerUnreadNotificationCount(customerId: string, storeId: string) {
  await connectDatabase();
  const count = await CustomerNotificationModel.countDocuments({ customerId, storeId, read: false });
  return { ok: true as const, data: { count } };
}
