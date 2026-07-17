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
import { resolveStorageLimitMB } from "../stores/store-override.service.js";

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

  const plan = (await PlanModel.findById(planId).lean()) as { limits?: { storage?: number } } | null;
  const storageFeature = (await PlanFeatureModel.findOne({ planId, featureKey: "storage" }).lean()) as
    | { limit?: number }
    | null;
  const limitMB = storageFeature?.limit ?? plan?.limits?.storage ?? 512;
  return {
    planId,
    storageLimitMB: limitMB,
    maxFileSizeMB: 10,
    allowedMimeTypes: [],
    maxUploads: 0,
    maxImages: 0,
    maxDocuments: 0,
    unlimited: limitMB === 0,
  };
}

// ── Full resync from MediaFile documents ─────────────────────────────
// This is ONLY for migration, cron verification, and admin requests.
// Normal page loads MUST NOT call this — use getStorageStats() instead.
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

  // Sync Store model denormalized fields
  await StoreModel.updateOne(
    { _id: storeId },
    {
      $set: {
        storageUsedBytes: usedBytes,
        storageLimitBytes: limitBytes,
        storageUpdatedAt: new Date(),
      },
    }
  );

  return usage;
}

// ── Read stats from database (NO filesystem scanning) ────────────────
export async function getStorageStats(storeId: string) {
  await connectDatabase();
  const usage = (await StorageUsageModel.findOne({ storeId }).lean()) as {
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
  let limitBytes = usage?.unlimited ? 0 : usage?.limitBytes ?? 0;
  if (limitBytes <= 0) {
    const resolved = await resolveStorageLimitMB(storeId);
    limitBytes = resolved.unlimited ? 0 : Math.round(resolved.limitMB * 1024 * 1024);
  }
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

// ── Add storage after upload (atomic $inc, NO resync) ────────────────
export async function adjustStorageOnUpload(storeId: string, size: number, fileType: string) {
  await connectDatabase();
  const category = fileType as "image" | "document" | "video";
  const inc: Record<string, number> = { usedBytes: size, fileCount: 1 };
  if (category === "image") inc.imageCount = 1;
  if (category === "document") inc.documentCount = 1;
  if (category === "video") inc.videoCount = 1;

  // Atomic increment on StorageUsage
  await StorageUsageModel.findOneAndUpdate({ storeId }, { $inc: inc }, { upsert: true });

  // Atomic increment on Store model denormalized field
  await StoreModel.updateOne({ _id: storeId }, { $inc: { storageUsedBytes: size }, $set: { storageUpdatedAt: new Date() } });

  await StoreUsageModel.findOneAndUpdate(
    { storeId },
    { $inc: { storageMB: Math.ceil(size / (1024 * 1024)), media: 1 } },
    { upsert: true }
  );
}

// ── Subtract storage after delete (atomic $inc, NO resync) ───────────
export async function adjustStorageOnDelete(storeId: string, size: number, fileType: string) {
  await connectDatabase();
  const category = fileType as "image" | "document" | "video";
  const dec: Record<string, number> = { usedBytes: -size, fileCount: -1 };
  if (category === "image") dec.imageCount = -1;
  if (category === "document") dec.documentCount = -1;
  if (category === "video") dec.videoCount = -1;

  // Atomic decrement on StorageUsage (floor at 0)
  await StorageUsageModel.findOneAndUpdate(
    { storeId },
    { $inc: dec },
  );
  // Also update Store model
  await StoreModel.updateOne(
    { _id: storeId, storageUsedBytes: { $gte: size } },
    { $inc: { storageUsedBytes: -size }, $set: { storageUpdatedAt: new Date() } }
  );
}

// ── Bulk adjust for multiple files (single DB write) ─────────────────
export async function bulkAdjustStorageOnUpload(storeId: string, files: Array<{ size: number; fileType: string }>) {
  await connectDatabase();
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  let imageCount = 0;
  let documentCount = 0;
  let videoCount = 0;
  for (const f of files) {
    if (f.fileType === "image") imageCount++;
    else if (f.fileType === "document") documentCount++;
    else if (f.fileType === "video") videoCount++;
  }

  const inc: Record<string, number> = { usedBytes: totalSize, fileCount: files.length };
  if (imageCount > 0) inc.imageCount = imageCount;
  if (documentCount > 0) inc.documentCount = documentCount;
  if (videoCount > 0) inc.videoCount = videoCount;

  await StorageUsageModel.findOneAndUpdate({ storeId }, { $inc: inc }, { upsert: true });
  await StoreModel.updateOne(
    { _id: storeId },
    { $inc: { storageUsedBytes: totalSize }, $set: { storageUpdatedAt: new Date() } }
  );
  await StoreUsageModel.findOneAndUpdate(
    { storeId },
    { $inc: { storageMB: Math.ceil(totalSize / (1024 * 1024)), media: files.length } },
    { upsert: true }
  );
}

export async function bulkAdjustStorageOnDelete(storeId: string, files: Array<{ size: number; fileType: string }>) {
  await connectDatabase();
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  let imageCount = 0;
  let documentCount = 0;
  let videoCount = 0;
  for (const f of files) {
    if (f.fileType === "image") imageCount++;
    else if (f.fileType === "document") documentCount++;
    else if (f.fileType === "video") videoCount++;
  }

  const dec: Record<string, number> = { usedBytes: -totalSize, fileCount: -files.length };
  if (imageCount > 0) dec.imageCount = -imageCount;
  if (documentCount > 0) dec.documentCount = -documentCount;
  if (videoCount > 0) dec.videoCount = -videoCount;

  await StorageUsageModel.findOneAndUpdate({ storeId }, { $inc: dec });
  await StoreModel.updateOne(
    { _id: storeId, storageUsedBytes: { $gte: totalSize } },
    { $inc: { storageUsedBytes: -totalSize }, $set: { storageUpdatedAt: new Date() } }
  );
}

// ── Replace file (old size out, new size in) ─────────────────────────
export async function adjustStorageOnReplace(storeId: string, oldSize: number, newSize: number, fileType: string) {
  const diff = newSize - oldSize;
  if (diff === 0) return;

  if (diff > 0) {
    // Net increase
    await adjustStorageOnUpload(storeId, diff, fileType);
  } else {
    // Net decrease (diff is negative)
    await adjustStorageOnDelete(storeId, Math.abs(diff), fileType);
  }
}

// ── Recalculate storage for all stores (migration) ──────────────────
export async function recalculateAllStoreStorage() {
  await connectDatabase();
  const storeIds = await StoreModel.find({}).distinct("_id");
  const results = { processed: 0, failed: 0 };
  for (const id of storeIds) {
    try {
      await syncStorageUsage(String(id));
      results.processed++;
    } catch {
      results.failed++;
    }
  }
  return results;
}

// ── Verify and fix mismatches (cron) ─────────────────────────────────
export async function verifyStorageUsage() {
  await connectDatabase();
  const storeIds = await StoreModel.find({}).distinct("_id");
  const results = { checked: 0, mismatched: 0, fixed: 0, errors: 0 };
  for (const id of storeIds) {
    try {
      const storeId = String(id);
      // Full resync
      const files = await MediaFileModel.find({ storeId, isDeleted: false }).lean();
      const actualBytes = files.reduce((sum, f) => sum + (f.size ?? 0), 0);

      const stored = await StorageUsageModel.findOne({ storeId }).lean() as { usedBytes?: number } | null;
      const storedBytes = stored?.usedBytes ?? 0;

      const diff = Math.abs(actualBytes - storedBytes);
      if (diff > 1024) {
        // More than 1KB off — fix it
        await syncStorageUsage(storeId);
        results.mismatched++;
        results.fixed++;
      }
      results.checked++;
    } catch {
      results.errors++;
    }
  }
  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────
export function formatStorageSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(1024, idx);
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export function getStoragePercentage(usedBytes: number, limitBytes: number): number {
  if (limitBytes <= 0) return 0;
  return Math.min(100, Math.round((usedBytes / limitBytes) * 100));
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
