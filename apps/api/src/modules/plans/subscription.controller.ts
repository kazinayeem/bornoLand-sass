import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import { getStoreUsageReport } from "./usage.service.js";

export async function getStoreSubscriptionDashboardController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!userId || !storeId) return sendFailure(response, "Unauthorized", 401);

  await connectDatabase();

  const store = await StoreModel.findOne({ _id: storeId, userId })
    .populate("planId")
    .lean() as Record<string, unknown> | null;

  if (!store) return sendFailure(response, "Store not found", 404);

  const plan = store.planId as Record<string, unknown> | null;

  const usage = await getStoreUsageReport(storeId);

  return sendSuccess(response, {
    store: {
      _id: store._id,
      name: store.name,
      slug: store.slug,
      status: store.status,
      billingStatus: store.billingStatus,
      subscriptionStatus: store.subscriptionStatus,
      trialEndsAt: store.trialEndsAt,
      trialStartedAt: store.trialStartedAt,
      published: store.published,
      allowNewOrders: store.allowNewOrders,
      plan: store.plan,
    },
    plan: plan ? {
      _id: plan._id,
      name: plan.name,
      slug: plan.slug,
      priceBDT: plan.priceBDT,
      trialDays: plan.trialDays,
      limits: plan.limits,
      featureToggles: plan.featureToggles,
      isActive: plan.isActive,
    } : null,
    usage,
  });
}

export async function getStoreDashboardStatsController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || request.params.id || "");
  if (!userId || !storeId) return sendFailure(response, "Unauthorized", 401);

  await connectDatabase();

  const store = await StoreModel.findOne({ _id: storeId, userId })
    .populate("planId")
    .lean() as Record<string, unknown> | null;

  if (!store) return sendFailure(response, "Store not found", 404);

  const plan = store.planId as Record<string, unknown> | null;
  const usage = await getStoreUsageReport(storeId);
  const limits = (plan?.limits || {}) as Record<string, number>;

  const items: Array<{ key: string; label: string; current: number; limit: number }> = [
    { key: "products", label: "Products", current: usage.products, limit: limits.products ?? 0 },
    { key: "categories", label: "Categories", current: usage.categories, limit: limits.categories ?? 0 },
    { key: "collections", label: "Collections", current: usage.collections, limit: limits.collections ?? 0 },
    { key: "orders", label: "Orders", current: usage.orders, limit: limits.orders ?? 0 },
    { key: "customers", label: "Customers", current: usage.customers, limit: limits.customers ?? 0 },
    { key: "staff", label: "Staff", current: usage.staff, limit: limits.staff ?? 0 },
    { key: "pages", label: "Pages", current: usage.pages, limit: limits.pages ?? 0 },
    { key: "coupons", label: "Coupons", current: usage.coupons, limit: limits.coupons ?? 0 },
    { key: "reviews", label: "Reviews", current: usage.reviews, limit: limits.reviews ?? 0 },
    { key: "media", label: "Media Files", current: usage.media, limit: limits.mediaUploads ?? 0 },
  ];

  const enriched = items.map((item) => ({
    ...item,
    isDisabled: item.limit === 0,
    isUnlimited: item.limit === -1,
    percent: item.limit > 0 ? Math.min(100, Math.round((item.current / item.limit) * 100)) : 0,
    remaining: item.limit > 0 ? Math.max(0, item.limit - item.current) : 0,
  }));

  return sendSuccess(response, {
    usage: enriched,
    storage: {
      usedMB: usage.storageMB,
      limitMB: usage.storageLimitMB,
      percent: usage.storagePercent,
      usedFormatted: usage.storageUsedFormatted,
      limitFormatted: usage.storageLimitFormatted,
      remainingMB: usage.storageRemainingMB,
    },
    plan: plan ? {
      _id: plan._id,
      name: plan.name,
      slug: plan.slug,
      priceBDT: plan.priceBDT,
      trialDays: plan.trialDays,
      featureToggles: plan.featureToggles,
    } : null,
  });
}
