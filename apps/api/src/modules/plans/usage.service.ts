import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { ProductModel } from "../../models/product.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { OrderModel } from "../../models/order.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { StorePageModel } from "../pages/store-page.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { CouponModel } from "../../models/coupon.model.js";
import { CollectionModel } from "../../models/collection.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { MediaFileModel } from "../../models/media-file.model.js";
import { StorageUsageModel } from "../../models/storage-usage.model.js";
import { resolveStorageLimitMB } from "../stores/store-override.service.js";

export type StoreUsageReport = {
  products: number;
  categories: number;
  orders: number;
  customers: number;
  staff: number;
  pages: number;
  collections: number;
  reviews: number;
  coupons: number;
  media: number;
  storageMB: number;
  storageLimitMB: number;
  storageUsedBytes: number;
  storageUsedFormatted: string;
  storageLimitFormatted: string;
  storagePercent: number;
  storageRemainingMB: number;
};

function formatMB(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

export async function getStoreUsageReport(storeId: string): Promise<StoreUsageReport> {
  await connectDatabase();

  const storeObjectId = storeId;

  const [
    products, categories, orders, customers, pages,
    collections, reviews, coupons, media,
    storageUsage,
    staff,
  ] = await Promise.all([
    ProductModel.countDocuments({ storeId: storeObjectId }),
    CategoryModel.countDocuments({ storeId: storeObjectId }),
    OrderModel.countDocuments({ storeId: storeObjectId }),
    CustomerModel.countDocuments({ storeId: storeObjectId }),
    StorePageModel.countDocuments({ storeId: storeObjectId, deletedAt: null }),
    CollectionModel.countDocuments({ storeId: storeObjectId }),
    ReviewModel.countDocuments({ storeId: storeObjectId }),
    CouponModel.countDocuments({ storeId: storeObjectId }),
    MediaFileModel.countDocuments({ storeId: storeObjectId, isDeleted: { $ne: true } }),
    StorageUsageModel.findOne({ storeId: storeObjectId }).lean(),
    TeamMemberModel.countDocuments({ tenantId: ((await StoreModel.findById(storeObjectId).select("tenantId").lean()) as { tenantId?: unknown } | null)?.tenantId ?? "" }),
  ]);

  const usedBytes = (storageUsage as { usedBytes?: number } | null)?.usedBytes ?? 0;
  let limitBytes = (storageUsage as { limitBytes?: number } | null)?.limitBytes ?? 0;
  const cachedUnlimited = (storageUsage as { unlimited?: boolean } | null)?.unlimited ?? false;
  if (limitBytes <= 0) {
    const resolved = await resolveStorageLimitMB(storeId);
    limitBytes = resolved.unlimited ? 0 : Math.round(resolved.limitMB * 1024 * 1024);
    // Persist resolved limit for future reads
    if (limitBytes > 0 || resolved.unlimited) {
      const { StorageUsageModel: SUM } = await import("../../models/storage-usage.model.js");
      await SUM.findOneAndUpdate(
        { storeId: storeObjectId },
        { $set: { limitBytes: resolved.unlimited ? 0 : limitBytes, unlimited: resolved.unlimited } },
        { upsert: true }
      );
    }
  } else {
    // Check if plan limit changed since last sync
    const resolved = await resolveStorageLimitMB(storeId);
    const currentPlanLimitBytes = resolved.unlimited ? 0 : Math.round(resolved.limitMB * 1024 * 1024);
    if (currentPlanLimitBytes !== limitBytes || resolved.unlimited !== cachedUnlimited) {
      limitBytes = currentPlanLimitBytes;
      const { StorageUsageModel: SUM } = await import("../../models/storage-usage.model.js");
      await SUM.findOneAndUpdate(
        { storeId: storeObjectId },
        { $set: { limitBytes: currentPlanLimitBytes, unlimited: resolved.unlimited } },
        { upsert: true }
      );
      // Also sync Store model
      const store = await StoreModel.findById(storeObjectId).select("_id").lean();
      if (store) {
        await StoreModel.updateOne(
          { _id: storeObjectId },
          { $set: { storageLimitBytes: currentPlanLimitBytes, storageUpdatedAt: new Date() } }
        );
      }
    }
  }
  const storageMB = Math.round(usedBytes / (1024 * 1024));
  const limitMB = Math.round(limitBytes / (1024 * 1024));
  const percent = limitMB > 0 ? Math.min(100, Math.round((storageMB / limitMB) * 100)) : 0;

  return {
    products, categories, orders, customers, staff, pages,
    collections, reviews, coupons, media,
    storageMB,
    storageLimitMB: limitMB,
    storageUsedBytes: usedBytes,
    storageUsedFormatted: formatMB(storageMB),
    storageLimitFormatted: formatMB(limitMB),
    storagePercent: percent,
    storageRemainingMB: Math.max(0, limitMB - storageMB),
  };
}

export async function getStoreUsageForPlan(storeId: string): Promise<Record<string, number>> {
  await connectDatabase();

  const storeObjectId = storeId;

  const [
    products, categories, orders, customers, pages,
    collections, reviews, coupons, media,
  ] = await Promise.all([
    ProductModel.countDocuments({ storeId: storeObjectId }),
    CategoryModel.countDocuments({ storeId: storeObjectId }),
    OrderModel.countDocuments({ storeId: storeObjectId }),
    CustomerModel.countDocuments({ storeId: storeObjectId }),
    StorePageModel.countDocuments({ storeId: storeObjectId, deletedAt: null }),
    CollectionModel.countDocuments({ storeId: storeObjectId }),
    ReviewModel.countDocuments({ storeId: storeObjectId }),
    CouponModel.countDocuments({ storeId: storeObjectId }),
    MediaFileModel.countDocuments({ storeId: storeObjectId, isDeleted: { $ne: true } }),
  ]);

  return {
    products, categories, orders, customers,
    pages, collections, reviews, coupons, media,
  };
}

export async function getPlanSubscriberCount(planId: string): Promise<number> {
  await connectDatabase();
  return StoreModel.countDocuments({ planId, status: { $ne: "archived" } });
}

export async function getPlanRevenue(planId: string): Promise<number> {
  await connectDatabase();
  const result = await OrderModel.aggregate([
    { $match: { planId: planId as any, paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  return result[0]?.total ?? 0;
}

export function checkLimitReached(current: number, limit: number): boolean {
  if (limit === 0) return true;
  return current >= limit;
}

export function getLimitMessage(resourceName: string, limit: number): string {
  return limit === 0
    ? `${resourceName} are not available on your current plan.`
    : `You have reached the ${resourceName} limit (${limit}) for your current plan. Upgrade to add more.`;
}
