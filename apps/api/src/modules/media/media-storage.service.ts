import crypto from "crypto";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../stores/store.model.js";
import { PlanFeatureModel } from "../features/plan-feature.model.js";
import { PlanModel } from "../plans/plan.model.js";
import { StoreUsageModel } from "../features/store-usage.model.js";
import { MediaFileModel } from "./media-file.model.js";
import { StorageUsageModel } from "./storage-usage.model.js";
import { StoragePlanModel } from "./storage-plan.model.js";
import { UploadLogModel } from "./upload-log.model.js";
import { getMediaCategory } from "./media.constants.js";

export function hashBuffer(buffer: Buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

type StoragePlanSettings = {
  planId: string;
  storageLimitMB: number;
  maxFileSizeMB: number;
  allowedMimeTypes: string[];
  maxUploads: number;
  maxImages: number;
  maxDocuments: number;
  unlimited: boolean;
};

export async function getStoragePlanSettings(planId: string): Promise<StoragePlanSettings> {
  await connectDatabase();
  const existing = await StoragePlanModel.findOne({ planId }).lean();
  if (existing) {
    return existing as unknown as StoragePlanSettings;
  }

  const plan = (await PlanModel.findById(planId).lean()) as { limits?: { storageGB?: number } } | null;
  const storageFeature = (await PlanFeatureModel.findOne({ planId, featureKey: "storage" }).lean()) as
    | { limit?: number }
    | null;
  const limitGB = storageFeature?.limit ?? plan?.limits?.storageGB ?? 1;
  return {
    planId,
    storageLimitMB: limitGB === 0 ? 0 : limitGB * 1024,
    maxFileSizeMB: 10,
    allowedMimeTypes: [],
    maxUploads: 0,
    maxImages: 0,
    maxDocuments: 0,
    unlimited: limitGB === 0,
  };
}

export async function syncStorageUsage(storeId: string) {
  await connectDatabase();
  const store = (await StoreModel.findById(storeId).lean()) as {
    _id: unknown;
    tenantId?: unknown;
    planId?: unknown;
  } | null;
  if (!store) return null;

  const files = await MediaFileModel.find({ storeId, isDeleted: false }).lean();
  const usedBytes = files.reduce((sum, f) => sum + (f.size ?? 0), 0);
  const imageCount = files.filter((f) => f.fileType === "image").length;
  const documentCount = files.filter((f) => f.fileType === "document").length;
  const videoCount = files.filter((f) => f.fileType === "video").length;

  const planSettings = store.planId ? await getStoragePlanSettings(String(store.planId)) : null;
  const limitBytes = planSettings?.unlimited ? 0 : (planSettings?.storageLimitMB ?? 1024) * 1024 * 1024;

  const usage = await StorageUsageModel.findOneAndUpdate(
    { storeId },
    {
      $set: {
        tenantId: store.tenantId,
        usedBytes,
        limitBytes,
        fileCount: files.length,
        imageCount,
        documentCount,
        videoCount,
        unlimited: planSettings?.unlimited ?? false,
        lastSyncedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  ).lean();

  await StoreUsageModel.findOneAndUpdate(
    { storeId },
    { $set: { storageMB: Math.ceil(usedBytes / (1024 * 1024)), media: files.length } },
    { upsert: true }
  );

  return usage;
}

export async function getStorageStats(storeId: string) {
  await connectDatabase();
  const usage = (await syncStorageUsage(storeId)) as {
    usedBytes: number;
    limitBytes: number;
    fileCount: number;
    imageCount: number;
    documentCount: number;
    videoCount: number;
    unlimited: boolean;
    uploadsSuspended: boolean;
  } | null;

  const usedBytes = usage?.usedBytes ?? 0;
  const limitBytes = usage?.unlimited ? 0 : usage?.limitBytes ?? 0;
  const percentUsed = limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0;

  return {
    usedBytes,
    limitBytes,
    availableBytes: limitBytes > 0 ? Math.max(0, limitBytes - usedBytes) : 0,
    percentUsed,
    fileCount: usage?.fileCount ?? 0,
    imageCount: usage?.imageCount ?? 0,
    documentCount: usage?.documentCount ?? 0,
    videoCount: usage?.videoCount ?? 0,
    unlimited: usage?.unlimited ?? false,
    uploadsSuspended: usage?.uploadsSuspended ?? false,
    usedMB: Math.round((usedBytes / (1024 * 1024)) * 100) / 100,
    limitMB: limitBytes > 0 ? Math.round((limitBytes / (1024 * 1024)) * 100) / 100 : 0,
    limitGB: limitBytes > 0 ? Math.round((limitBytes / (1024 * 1024 * 1024)) * 100) / 100 : 0,
  };
}

export async function adjustStorageOnUpload(storeId: string, size: number, fileType: string) {
  await connectDatabase();
  const category = fileType as "image" | "document" | "video";
  const inc: Record<string, number> = { usedBytes: size, fileCount: 1 };
  if (category === "image") inc.imageCount = 1;
  if (category === "document") inc.documentCount = 1;
  if (category === "video") inc.videoCount = 1;
  await StorageUsageModel.findOneAndUpdate({ storeId }, { $inc: inc }, { upsert: true });
  await syncStorageUsage(storeId);
}

export async function adjustStorageOnDelete(storeId: string, size: number, fileType: string) {
  await connectDatabase();
  const category = fileType as "image" | "document" | "video";
  const dec: Record<string, number> = { usedBytes: -size, fileCount: -1 };
  if (category === "image") dec.imageCount = -1;
  if (category === "document") dec.documentCount = -1;
  if (category === "video") dec.videoCount = -1;
  await StorageUsageModel.findOneAndUpdate({ storeId }, { $inc: dec });
  await syncStorageUsage(storeId);
}

export async function logUploadAction(payload: {
  storeId: string;
  mediaFileId?: string;
  uploaderId?: string;
  action: string;
  fileName?: string;
  size?: number;
  status?: "success" | "failed";
  message?: string;
}) {
  await connectDatabase();
  await UploadLogModel.create(payload);
}

export async function findDuplicateByHash(storeId: string, hash: string) {
  await connectDatabase();
  return MediaFileModel.findOne({ storeId, hash, isDeleted: false }).lean();
}
