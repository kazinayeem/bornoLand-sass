import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { ContactModel } from "./contact.model.js";
import { NotificationModel } from "./notification.model.js";
import type { ContactStatus } from "./contact.model.js";
import { listContactMessagesSchema, updateContactMessageSchema } from "./contact-message.validator.js";

function serializeMessage(doc: Record<string, unknown>) {
  return {
    ...doc,
    id: String(doc._id),
    _id: String(doc._id),
    storeId: String(doc.storeId),
  };
}

export async function submitContact(
  storeId: string,
  payload: { name: string; email: string; phone?: string; subject?: string; message: string },
) {
  await connectDatabase();
  const message = await ContactModel.create({
    storeId,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? "",
    subject: payload.subject ?? "",
    message: payload.message,
    status: "new",
  });

  const store: any = await StoreModel.findById(storeId).select("userId slug name").lean();
  if (store?.userId) {
    await NotificationModel.create({
      userId: store.userId,
      storeId,
      title: "New customer message",
      message: `${payload.name} sent a message${payload.subject ? `: ${payload.subject}` : ""}`,
      type: "contact_message",
      isRead: false,
      actionUrl: `/store/${store.slug}/customer-messages`,
      metadata: { contactId: String(message._id) },
    });
  }


  return { ok: true as const, message: "Message sent successfully" };
}

export async function listContactMessages(storeId: string, userId: string, query: unknown) {
  const parsed = listContactMessagesSchema.safeParse(query);
  if (!parsed.success) return { ok: false as const, message: "Invalid query parameters" };

  await connectDatabase();
  const store: any = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };


  const { page, limit, search, status, archived } = parsed.data;
  const filter: Record<string, unknown> = { storeId };

  if (status) filter.status = status;
  if (archived === "true") filter.archivedAt = { $ne: null };
  if (archived === "false") filter.archivedAt = null;

  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
      { phone: { $regex: term, $options: "i" } },
      { subject: { $regex: term, $options: "i" } },
      { message: { $regex: term, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [messages, total, statusCounts] = await Promise.all([
    ContactModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ContactModel.countDocuments(filter),
    ContactModel.aggregate([
      { $match: { storeId: store._id, archivedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const counts = Object.fromEntries(statusCounts.map((row) => [row._id, row.count])) as Record<ContactStatus, number>;

  return {
    ok: true as const,
    data: {
      messages: messages.map((item) => serializeMessage(item as Record<string, unknown>)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      statusCounts: counts,
    },
  };
}

export async function getContactMessage(storeId: string, userId: string, messageId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const message = await ContactModel.findOne({ _id: messageId, storeId }).lean();
  if (!message) return { ok: false as const, message: "Message not found" };

  if (message.status === "new") {
    await ContactModel.updateOne({ _id: messageId }, { $set: { status: "read" } });
    (message as { status: string }).status = "read";
  }

  return { ok: true as const, data: { message: serializeMessage(message as Record<string, unknown>) } };
}

export async function updateContactMessage(storeId: string, userId: string, messageId: string, payload: unknown) {
  const parsed = updateContactMessageSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid update data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const update: Record<string, unknown> = {};
  if (parsed.data.status) {
    update.status = parsed.data.status;
    if (parsed.data.status === "replied") update.repliedAt = new Date();
  }
  if (parsed.data.notes !== undefined) update.notes = parsed.data.notes;
  if (parsed.data.archived === true) update.archivedAt = new Date();
  if (parsed.data.archived === false) update.archivedAt = null;

  const message = await ContactModel.findOneAndUpdate(
    { _id: messageId, storeId },
    { $set: update },
    { new: true },
  ).lean();

  if (!message) return { ok: false as const, message: "Message not found" };
  return { ok: true as const, data: { message: serializeMessage(message as Record<string, unknown>) } };
}

export async function deleteContactMessage(storeId: string, userId: string, messageId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const deleted = await ContactModel.findOneAndDelete({ _id: messageId, storeId });
  if (!deleted) return { ok: false as const, message: "Message not found" };
  return { ok: true as const, data: { deleted: true } };
}

export async function exportContactMessages(storeId: string, userId: string, query: unknown) {
  const parsed = listContactMessagesSchema.safeParse(Object.assign({}, (query as object) || {}, { page: 1, limit: 10000 }));
  if (!parsed.success) return { ok: false as const, message: "Invalid query parameters" };

  await connectDatabase();
  const store: any = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const { search, status, archived } = parsed.data;
  const filter: Record<string, unknown> = { storeId };
  if (status) filter.status = status;
  if (archived === "true") filter.archivedAt = { $ne: null };
  if (archived === "false") filter.archivedAt = null;
  if (search?.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
      { subject: { $regex: term, $options: "i" } },
      { message: { $regex: term, $options: "i" } },
    ];
  }

  const messages = await ContactModel.find(filter).sort({ createdAt: -1 }).lean();
  const header = ["Name", "Email", "Phone", "Subject", "Message", "Status", "Submitted", "Notes"];
  const rows = messages.map((item) => [
    item.name,
    item.email,
    item.phone ?? "",
    item.subject ?? "",
    item.message.replace(/"/g, '""'),
    item.status,
    new Date(item.createdAt as Date).toISOString(),
    (item.notes ?? "").replace(/"/g, '""'),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/\n/g, " ")}"`).join(","))
    .join("\n");

  return { ok: true as const, data: { csv, filename: `contact-messages-${store.slug}-${Date.now()}.csv` } };
}

