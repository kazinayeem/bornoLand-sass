import { connectDatabase } from "../config/database.js";
import { StoreModel } from "../models/store.model.js";
import { StoreSettingsModel } from "../models/store-settings.model.js";
import { updateStoreSettingsSchema } from "../validators/store-settings.validator.js";

const defaultSettings = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "before",
  locale: "en-US",
  decimalPlaces: 2,
  taxRate: 0,
  dateFormat: "MM/DD/YYYY",
  timezone: "UTC",
  language: "en",
} as const;

export async function ensureDefaultStoreSettings(storeId: string) {
  await connectDatabase();
  const existing = await StoreSettingsModel.findOne({ storeId });
  if (existing) return existing;
  return StoreSettingsModel.create({ storeId, ...defaultSettings });
}

export async function getStoreSettings(storeId: string, userId?: string) {
  await connectDatabase();
  if (userId) {
    const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
    if (!store) return { ok: false as const, message: "Store not found" };
  }
  const settings = await StoreSettingsModel.findOne({ storeId }).lean();
  return { ok: true as const, data: { settings: settings ?? null } };
}

export async function updateStoreSettings(storeId: string, userId: string, payload: unknown) {
  const parsed = updateStoreSettingsSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid settings data" };

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const settings = await StoreSettingsModel.findOneAndUpdate(
    { storeId },
    { $set: parsed.data, $setOnInsert: { storeId } },
    { upsert: true, new: true }
  ).lean();

  return { ok: true as const, data: { settings } };
}
