import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreEmailConfigModel } from "./store-email-config.model.js";
import { updateEmailConfigSchema } from "./store-email-config.validator.js";
import { encrypt, decrypt } from "../../common/utils/encryption.js";

const defaultConfig = {
  senderName: "",
  senderEmail: "",
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassEncrypted: "",
  encryption: "tls" as const,
  replyToEmail: "",
  bccEmail: "",
  enabled: false,
  defaultLanguage: "en",
  timezone: "UTC",
} as const;

function serializeConfig(doc: Record<string, unknown> | null | undefined, storeId: string) {
  const hasPassword = Boolean(doc?.smtpPassEncrypted && String(doc.smtpPassEncrypted).length > 0);
  return {
    _id: doc?._id ? String(doc._id) : undefined,
    storeId: String(doc?.storeId ?? storeId),
    senderName: String(doc?.senderName ?? defaultConfig.senderName),
    senderEmail: String(doc?.senderEmail ?? defaultConfig.senderEmail),
    smtpHost: String(doc?.smtpHost ?? defaultConfig.smtpHost),
    smtpPort: Number(doc?.smtpPort ?? defaultConfig.smtpPort),
    smtpUser: String(doc?.smtpUser ?? defaultConfig.smtpUser),
    smtpPassSet: hasPassword,
    encryption: String(doc?.encryption ?? defaultConfig.encryption),
    replyToEmail: String(doc?.replyToEmail ?? defaultConfig.replyToEmail),
    bccEmail: String(doc?.bccEmail ?? defaultConfig.bccEmail),
    enabled: Boolean(doc?.enabled ?? defaultConfig.enabled),
    defaultLanguage: String(doc?.defaultLanguage ?? defaultConfig.defaultLanguage),
    timezone: String(doc?.timezone ?? defaultConfig.timezone),
    createdAt: doc?.createdAt ? new Date(doc.createdAt as string | Date).toISOString() : undefined,
    updatedAt: doc?.updatedAt ? new Date(doc.updatedAt as string | Date).toISOString() : undefined,
  };
}

export async function ensureDefaultEmailConfig(storeId: string) {
  await connectDatabase();
  const existing = await StoreEmailConfigModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  if (existing) return serializeConfig(existing, storeId);
  const created = await StoreEmailConfigModel.create({ storeId, ...defaultConfig });
  return serializeConfig(created.toObject() as Record<string, unknown>, storeId);
}

export async function getEmailConfig(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const config = await StoreEmailConfigModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  return {
    ok: true as const,
    data: { config: serializeConfig(config, storeId) },
  };
}

export async function updateEmailConfig(storeId: string, userId: string, payload: unknown) {
  const parsed = updateEmailConfigSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid email config data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.smtpPass) {
    update.smtpPassEncrypted = encrypt(parsed.data.smtpPass);
  }
  delete update.smtpPass;

  const config = await StoreEmailConfigModel.findOneAndUpdate(
    { storeId },
    { $set: update, $setOnInsert: { storeId } },
    { upsert: true, new: true, runValidators: true },
  ).lean() as Record<string, unknown> | null;

  return {
    ok: true as const,
    data: { config: serializeConfig(config, storeId) },
  };
}

export async function getDecryptedEmailConfig(storeId: string) {
  await connectDatabase();
  const config = await StoreEmailConfigModel.findOne({ storeId }).lean() as Record<string, unknown> | null;
  if (!config || !config.enabled) return null;
  const encryptedPass = config.smtpPassEncrypted as string;
  if (!encryptedPass) return null;

  try {
    const smtpPass = decrypt(encryptedPass);
    return {
      senderName: String(config.senderName ?? ""),
      senderEmail: String(config.senderEmail ?? ""),
      smtpHost: String(config.smtpHost ?? ""),
      smtpPort: Number(config.smtpPort ?? 587),
      smtpUser: String(config.smtpUser ?? ""),
      smtpPass,
      encryption: String(config.encryption ?? "tls") as "tls" | "ssl" | "starttls" | "none",
      replyToEmail: String(config.replyToEmail ?? ""),
      bccEmail: String(config.bccEmail ?? ""),
    };
  } catch {
    return null;
  }
}
