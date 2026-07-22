import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreEmailLogModel } from "./store-email-log.model.js";

export async function createEmailLog(data: {
  storeId: string;
  recipient: string;
  subject: string;
  templateName?: string;
  status?: string;
  providerResponse?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  await connectDatabase();
  return StoreEmailLogModel.create({
    storeId: data.storeId,
    recipient: data.recipient,
    subject: data.subject,
    templateName: data.templateName ?? "",
    status: data.status ?? "pending",
    sentAt: data.status === "sent" ? new Date() : undefined,
    providerResponse: data.providerResponse ?? "",
    errorMessage: data.errorMessage ?? "",
    metadata: data.metadata ?? {},
  });
}

export async function updateEmailLogStatus(
  logId: string,
  status: string,
  extra?: { providerResponse?: string; errorMessage?: string },
) {
  await connectDatabase();
  const update: Record<string, unknown> = { status };
  if (status === "sent") update.sentAt = new Date();
  if (extra?.providerResponse) update.providerResponse = extra.providerResponse;
  if (extra?.errorMessage) update.errorMessage = extra.errorMessage;
  return StoreEmailLogModel.findByIdAndUpdate(logId, { $set: update }, { new: true }).lean();
}

export async function getEmailLogs(
  storeId: string,
  userId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {},
) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { storeId };
  if (options.status) filter.status = options.status;
  if (options.search) {
    filter.$or = [
      { recipient: { $regex: options.search, $options: "i" } },
      { subject: { $regex: options.search, $options: "i" } },
    ];
  }

  const [logs, total] = await Promise.all([
    StoreEmailLogModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    StoreEmailLogModel.countDocuments(filter),
  ]);

  return {
    ok: true as const,
    data: { logs, total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getEmailLog(storeId: string, logId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const log = await StoreEmailLogModel.findOne({ _id: logId, storeId }).lean();
  if (!log) return { ok: false as const, message: "Email log not found" };
  return { ok: true as const, data: { log } };
}

export async function resendEmail(storeId: string, logId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const log = await StoreEmailLogModel.findOne({ _id: logId, storeId }).lean() as Record<string, unknown> | null;
  if (!log) return { ok: false as const, message: "Email log not found" };

  return {
    ok: true as const,
    data: {
      recipient: log.recipient as string,
      subject: log.subject as string,
      templateName: log.templateName as string,
    },
  };
}
