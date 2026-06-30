import { connectDatabase } from "../../common/database/connection.js";
import { PlatformSettingsModel } from "./platform-settings.model.js";
import { ensurePlatformSettingsSafe } from "../../bootstrap/safe-migrate.js";

const DEFAULT_SETTINGS = {
  key: "global",
  platformName: "BornoLand",
  trialEnabled: true,
  trialDays: 3,
  defaultPlanSlug: "free",
  currencyCode: "BDT",
  currencySymbol: "৳",
  currencyPosition: "before" as const,
  timezone: "Asia/Dhaka",
  maintenanceMode: false,
  vatPercent: 0,
  taxPercent: 0,
  invoicePrefix: "INV-",
  companyName: "BornoLand",
  enabledDurations: {
    monthly: true,
    quarterly: true,
    halfYearly: true,
    yearly: true,
    lifetime: false,
  },
};

export async function getPlatformSettings() {
  await ensurePlatformSettingsSafe();
  const settings = await PlatformSettingsModel.findOne({ key: "global" });
  return settings?.toObject() ?? DEFAULT_SETTINGS;
}

export async function updatePlatformSettings(payload: Record<string, unknown>) {
  await connectDatabase();
  const settings = await PlatformSettingsModel.findOneAndUpdate(
    { key: "global" },
    { $set: payload },
    { new: true, upsert: true }
  ).lean();
  return settings;
}

export async function getTrialConfig() {
  const settings = await getPlatformSettings();
  return {
    enabled: settings.trialEnabled !== false,
    days: typeof settings.trialDays === "number" && settings.trialDays > 0 ? settings.trialDays : 3,
  };
}
