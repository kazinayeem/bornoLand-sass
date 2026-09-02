import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { connectDatabase } from "../database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { ProductModel } from "../../models/product.model.js";
import { OrderModel } from "../../models/order.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { CouponModel } from "../../models/coupon.model.js";
import { ReviewModel } from "../../models/review.model.js";
import { CustomerModel } from "../../models/customer.model.js";
import { StorePageModel } from "../../modules/pages/store-page.model.js";
import { TeamMemberModel } from "../../models/team-member.model.js";
import { CollectionModel } from "../../models/collection.model.js";
import { StorageUsageModel } from "../../models/storage-usage.model.js";
import { MediaFileModel } from "../../models/media-file.model.js";
import {
  resolveStoreLimit,
  resolveStoreFeature,
  resolveStorageLimitMB,
} from "../../modules/stores/store-override.service.js";
import { StoreOverrideModel } from "../../modules/stores/store-override.model.js";

type LimitKey = keyof NonNullable<import("../../models/plan.model.js").PlanDocument["limits"]>;

const COUNTER_MAP: Record<string, (storeId: string) => Promise<number>> = {
  products: (sid) => ProductModel.countDocuments({ storeId: sid }),
  categories: (sid) => CategoryModel.countDocuments({ storeId: sid }),
  orders: (sid) => OrderModel.countDocuments({ storeId: sid }),
  customers: (sid) => CustomerModel.countDocuments({ storeId: sid }),
  staff: async (sid) => {
    const store = await StoreModel.findById(sid).select("tenantId").lean() as { tenantId?: unknown } | null;
    if (!store?.tenantId) return 0;
    return TeamMemberModel.countDocuments({ tenantId: store.tenantId });
  },
  pages: (sid) => StorePageModel.countDocuments({ storeId: sid, deletedAt: null }),
  collections: (sid) => CollectionModel.countDocuments({ storeId: sid }),
  reviews: (sid) => ReviewModel.countDocuments({ storeId: sid }),
  coupons: (sid) => CouponModel.countDocuments({ storeId: sid }),
  media: (sid) => MediaFileModel.countDocuments({ storeId: sid, isDeleted: { $ne: true } }),
};

export async function requirePlanLimit(req: AuthRequest, res: Response, next: NextFunction, limitKey: LimitKey) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const storeId = req.params.storeId || req.params.id || req.body?.storeId;
  if (!storeId) return res.status(400).json({ success: false, message: "Store ID required" });

  await connectDatabase();

  const store = await StoreModel.findById(storeId).select("_id billingStatus subscriptionStatus status").lean() as { _id?: unknown; billingStatus?: string; subscriptionStatus?: string; status?: string } | null;
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });

  const limit = await resolveStoreLimit(String(store._id), limitKey as string);

  if (limit === 0) {
    return res.status(403).json({
      success: false,
      message: `This feature is not available on your current plan.`,
      code: "FEATURE_NOT_AVAILABLE",
      requiredUpgrade: true,
    });
  }

  const counterFn = COUNTER_MAP[limitKey];
  const current = counterFn ? await counterFn(String(store._id)) : 0;

  if (current >= limit) {
    return res.status(403).json({
      success: false,
      message: `You have reached the ${limitKey} limit (${limit}) for your current plan. Upgrade to add more.`,
      code: "LIMIT_REACHED",
      current,
      limit,
      requiredUpgrade: true,
    });
  }

  next();
}

export async function requireFeatureEnabled(req: AuthRequest, res: Response, next: NextFunction, featureKey: string) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const storeId = req.params.storeId || req.params.id || req.body?.storeId;
  if (!storeId) return res.status(400).json({ success: false, message: "Store ID required" });

  await connectDatabase();

  const store = await StoreModel.findById(storeId).select("_id billingStatus subscriptionStatus status").lean() as { _id?: unknown; billingStatus?: string; subscriptionStatus?: string; status?: string } | null;
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });

  const enabled = await resolveStoreFeature(String(store._id), featureKey);

  if (!enabled) {
    return res.status(403).json({
      success: false,
      message: `This feature is not available on your current plan. Upgrade to enable ${featureKey}.`,
      code: "FEATURE_NOT_ENABLED",
      requiredUpgrade: true,
    });
  }

  next();
}

export async function requireStorageAvailable(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const storeId = req.params.storeId || req.params.id || req.body?.storeId;
  if (!storeId) return res.status(400).json({ success: false, message: "Store ID required" });

  await connectDatabase();

  const store = await StoreModel.findById(storeId).select("_id billingStatus subscriptionStatus status").lean() as { _id?: unknown; billingStatus?: string; subscriptionStatus?: string; status?: string } | null;
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });

  const storage = await resolveStorageLimitMB(String(store._id));

  if (storage.unlimited) {
    return next();
  }

  const usage = await StorageUsageModel.findOne({ storeId }).lean() as { usedBytes?: number; limitBytes?: number; uploadsSuspended?: boolean } | null;

  if (usage?.uploadsSuspended) {
    return res.status(403).json({
      success: false,
      message: "Storage full. Upgrade your plan to upload more files.",
      code: "STORAGE_FULL",
      requiredUpgrade: true,
    });
  }

  const effectiveLimitBytes = storage.limitMB * 1024 * 1024;
  if (usage && usage.usedBytes && usage.usedBytes >= effectiveLimitBytes) {
    return res.status(403).json({
      success: false,
      message: "Storage full. Upgrade your plan to upload more files.",
      code: "STORAGE_FULL",
      requiredUpgrade: true,
    });
  }

  next();
}

export async function requireSubscriptionActive(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  const storeId = req.params.storeId || req.params.id || req.body?.storeId;
  if (!storeId) return res.status(400).json({ success: false, message: "Store ID required" });

  await connectDatabase();

  // Also check override status
  const override = await StoreOverrideModel.findOne({ storeId }).lean() as Record<string, unknown> | null;

  const store = await StoreModel.findById(storeId).select("billingStatus subscriptionStatus status").lean() as { billingStatus?: string; subscriptionStatus?: string; status?: string } | null;
  if (!store) return res.status(404).json({ success: false, message: "Store not found" });

  const effectiveStatus = (override?.subscriptionStatusOverride as string) || store.subscriptionStatus || "";

  if (effectiveStatus === "expired" || effectiveStatus === "suspended" || store.status === "suspended") {
    return res.status(403).json({
      success: false,
      message: "Your subscription has expired. Renew to continue using the store.",
      code: "SUBSCRIPTION_EXPIRED",
    });
  }

  const effectiveBilling = (override?.billingStatusOverride as string) || store.billingStatus || "";
  if (effectiveBilling === "past_due" || effectiveBilling === "cancelled") {
    return res.status(403).json({
      success: false,
      message: "Your account is past due. Please renew your subscription.",
      code: "PAYMENT_PAST_DUE",
    });
  }

  next();
}
