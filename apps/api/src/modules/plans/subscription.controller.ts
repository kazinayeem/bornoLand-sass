import type { Response } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import { sendSuccess, sendFailure } from "../../common/utils/api-response.js";
import { getStoreUsageReport } from "./usage.service.js";
import { SubscriptionPaymentModel } from "../payments/subscription-payment.model.js";
import { getPlanPriceForDuration } from "./plan-pricing.util.js";
import { approveSubscriptionPayment } from "../payments/subscription-payment.service.js";
import mongoose from "mongoose";

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

export async function initiateCheckoutController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  const storeId = String(request.params.storeId || "");
  if (!userId || !storeId) return sendFailure(response, "Unauthorized", 401);

  const { planId, duration, paymentMethod } = request.body;
  if (!planId || !duration || !paymentMethod) {
    return sendFailure(response, "planId, duration, and paymentMethod are required", 400);
  }

  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId });
  if (!store) return sendFailure(response, "Store not found", 404);

  const plan = await PlanModel.findById(planId).lean();
  if (!plan) return sendFailure(response, "Plan not found", 404);

  const amount = getPlanPriceForDuration(plan as any, duration);

  const txnId = `TXN-${new mongoose.Types.ObjectId().toString().toUpperCase()}`;

  const payment = await SubscriptionPaymentModel.create({
    tenantId: store.tenantId,
    storeId: store._id,
    userId,
    planId: plan._id,
    duration,
    amount,
    paymentMethod,
    senderNumber: "01700000000", // Default sender number for mock online checkout
    transactionId: txnId,
    paymentDate: new Date(),
    status: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  return sendSuccess(response, {
    payment,
    mockRedirectUrl: `/store/${store.slug}/billing/payment-gateway-mock?paymentId=${payment._id}`,
  });
}

export async function checkoutCallbackController(request: AuthRequest, response: Response) {
  const userId = request.user?.userId;
  if (!userId) return sendFailure(response, "Unauthorized", 401);

  const { paymentId, status } = request.body;
  if (!paymentId || !status) {
    return sendFailure(response, "paymentId and status are required", 400);
  }

  await connectDatabase();

  const payment = await SubscriptionPaymentModel.findById(paymentId);
  if (!payment) return sendFailure(response, "Payment not found", 404);

  if (status === "success") {
    // Approve subscription payment automatically
    const result = await approveSubscriptionPayment(paymentId, userId, {});
    if (!result.ok) {
      return sendFailure(response, result.message ?? "Approval failed");
    }
    return sendSuccess(response, result.data, "Payment successful and subscription activated");
  } else {
    // Cancel the payment
    payment.status = "rejected";
    payment.rejectedReason = "Payment cancelled by user";
    await payment.save();
    return sendSuccess(response, { status: "cancelled" }, "Payment cancelled");
  }
}
