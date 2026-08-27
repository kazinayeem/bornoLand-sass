import mongoose from "mongoose";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { StoreSettingsModel } from "../../models/store-settings.model.js";
import { updateStoreSettingsSchema } from "./store-settings.validator.js";

const defaultSettings = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "before",
  locale: "en-US",
  decimalPlaces: 2,
  taxRate: 0,
  taxEnabled: false,
  taxIncluded: false,
  dateFormat: "MM/DD/YYYY",
  timezone: "UTC",
  language: "en",
} as const;

export async function ensureDefaultStoreSettings(storeId: string, session?: mongoose.ClientSession) {
  await connectDatabase();
  const queryOptions = session ? { session } : {};
  const existing = await StoreSettingsModel.findOne({ storeId }).session(session ?? null!);
  if (existing) return existing;
  return StoreSettingsModel.create([{ storeId, ...defaultSettings }], queryOptions).then((r) => r[0]);
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

  const rawData = { ...parsed.data } as Record<string, any>;

  // Normalize aliases
  if (rawData.guestCheckout !== undefined && rawData.guestCheckoutEnabled === undefined) {
    rawData.guestCheckoutEnabled = rawData.guestCheckout;
  }
  if (rawData.requireLogin !== undefined && rawData.requireLoginEnabled === undefined) {
    rawData.requireLoginEnabled = rawData.requireLogin;
  }
  if (rawData.minOrderAmount !== undefined && rawData.minimumOrderAmount === undefined) {
    rawData.minimumOrderAmount = rawData.minOrderAmount;
  }
  if (rawData.autoConfirm !== undefined && rawData.autoConfirmOrders === undefined) {
    rawData.autoConfirmOrders = rawData.autoConfirm;
  }
  if (rawData.codEnabled !== undefined || rawData.cashOnDelivery !== undefined) {
    const codVal = rawData.codEnabled ?? rawData.cashOnDelivery;
    rawData.paymentSettings = {
      ...(rawData.paymentSettings || {}),
      codEnabled: codVal,
    };
  }

  // If taxRate was updated and taxEnabled was not specified, turn on taxEnabled if taxRate > 0
  if (rawData.taxRate !== undefined && rawData.taxEnabled === undefined) {
    rawData.taxEnabled = rawData.taxRate > 0;
  }

  const settings = await StoreSettingsModel.findOneAndUpdate(
    { storeId },
    { $set: rawData, $setOnInsert: { storeId } },
    { upsert: true, new: true }
  ).lean();

  const { invalidateStoreTenantCache } = await import("../../common/cache/cache.service.js");
  invalidateStoreTenantCache(storeId).catch(() => {});

  return { ok: true as const, data: { settings } };
}

