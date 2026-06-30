import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../stores/store.model.js";
import { UserModel } from "../users/user.model.js";
import { PlanModel } from "../plans/plan.model.js";
import { StorageUsageModel } from "./storage-usage.model.js";
import { StoragePlanModel } from "./storage-plan.model.js";
import { MediaFileModel } from "./media-file.model.js";
import { getStorageStats, syncStorageUsage } from "./media-storage.service.js";
import { deleteMediaFile } from "./media.service.js";
import { getStorageProvider } from "./providers/index.js";

export async function platformStorageAnalyticsController(_request: AuthRequest, response: Response) {
  await connectDatabase();
  const usages = await StorageUsageModel.find().lean();
  const totalUsed = usages.reduce((sum, u) => sum + (u.usedBytes ?? 0), 0);
  const totalLimit = usages.reduce((sum, u) => sum + (u.unlimited ? 0 : u.limitBytes ?? 0), 0);
  const totalFiles = usages.reduce((sum, u) => sum + (u.fileCount ?? 0), 0);

  return sendSuccess(response, {
    analytics: {
      totalStores: usages.length,
      totalUsedBytes: totalUsed,
      totalLimitBytes: totalLimit,
      totalFreeBytes: Math.max(0, totalLimit - totalUsed),
      totalFiles,
      totalUsedGB: Math.round((totalUsed / (1024 ** 3)) * 100) / 100,
    },
  });
}

export async function platformStoreStorageListController(_request: AuthRequest, response: Response) {
  await connectDatabase();
  const stores = await StoreModel.find().select("name slug userId planId").lean();
  const rows = await Promise.all(
    stores.map(async (store) => {
      const stats = await getStorageStats(String(store._id));
      const owner = (await UserModel.findById(store.userId).select("name email").lean()) as
        | { name?: string; email?: string }
        | null;
      const plan = store.planId ? await PlanModel.findById(store.planId).select("name slug").lean() : null;
      return {
        storeId: store._id,
        storeName: store.name,
        storeSlug: store.slug,
        owner: owner ? { name: owner.name, email: owner.email } : null,
        plan,
        ...stats,
      };
    })
  );
  return sendSuccess(response, { stores: rows });
}

export async function updateStoreStorageController(request: AuthRequest, response: Response) {
  await connectDatabase();
  const storeId = String(request.params.storeId);
  const { limitMB, unlimited, uploadsSuspended, resetUsage } = request.body as {
    limitMB?: number;
    unlimited?: boolean;
    uploadsSuspended?: boolean;
    resetUsage?: boolean;
  };

  const update: Record<string, unknown> = {};
  if (typeof limitMB === "number") update.limitBytes = limitMB * 1024 * 1024;
  if (typeof unlimited === "boolean") update.unlimited = unlimited;
  if (typeof uploadsSuspended === "boolean") update.uploadsSuspended = uploadsSuspended;
  if (resetUsage) {
    update.usedBytes = 0;
    update.fileCount = 0;
    update.imageCount = 0;
    update.documentCount = 0;
    update.videoCount = 0;
  }

  await StorageUsageModel.findOneAndUpdate({ storeId }, { $set: update }, { upsert: true });
  if (!resetUsage) await syncStorageUsage(storeId);
  const stats = await getStorageStats(storeId);
  return sendSuccess(response, { stats }, "Storage settings updated");
}

export async function updatePlanStorageController(request: AuthRequest, response: Response) {
  await connectDatabase();
  const planId = String(request.params.planId);
  const body = request.body as Record<string, unknown>;
  const plan = await StoragePlanModel.findOneAndUpdate({ planId }, { $set: body }, { upsert: true, new: true }).lean();
  return sendSuccess(response, { plan }, "Plan storage settings updated");
}

export async function adminForceCleanupController(request: AuthRequest, response: Response) {
  await connectDatabase();
  const storeId = String(request.params.storeId);
  const files = await MediaFileModel.find({ storeId, isDeleted: false }).lean();
  const provider = getStorageProvider();
  for (const file of files) {
    await provider.delete(file.storagePath);
    await MediaFileModel.updateOne({ _id: file._id }, { $set: { isDeleted: true, deletedAt: new Date() } });
  }
  await StorageUsageModel.findOneAndUpdate(
    { storeId },
    { $set: { usedBytes: 0, fileCount: 0, imageCount: 0, documentCount: 0, videoCount: 0 } },
    { upsert: true }
  );
  return sendSuccess(response, { cleaned: files.length }, "Force cleanup complete");
}

export async function adminDeleteMediaController(request: AuthRequest, response: Response) {
  const storeId = String(request.params.storeId);
  const fileId = String(request.params.fileId);
  const result = await deleteMediaFile(storeId, fileId, request.user?.userId);
  return result.ok ? sendSuccess(response, result.data, "File deleted") : sendFailure(response, result.message, 404);
}
