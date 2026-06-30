import { connectDatabase } from "../../common/database/connection.js";
import { SubscriptionPaymentModel } from "../../models/subscription-payment.model.js";
import { PlatformPaymentMethodModel } from "../../models/platform-payment-method.model.js";
import { StoreModel } from "../../models/store.model.js";
import { PlanModel } from "../../models/plan.model.js";
import {
  submitSubscriptionPaymentSchema,
  rejectPaymentSchema,
  approvePaymentSchema,
  updatePlatformPaymentMethodSchema,
} from "./subscription-payment.validator.js";
import { addDays } from "../../common/utils/store-trial.js";
import { getPlanPriceForDuration, calculateSubscriptionExpireDate } from "../plans/plan-pricing.util.js";
import type { SubscriptionDuration } from "../subscriptions/subscription.constants.js";
import { activateStoreSubscription } from "../subscriptions/store-subscription.service.js";
import { createInvoice } from "../subscriptions/invoice.service.js";
import { createBillingNotification } from "../notifications/billing-notification.service.js";
import { getPlatformSettings } from "../settings/platform-settings.service.js";
import { ensurePlatformPaymentMethodsSafe } from "../../bootstrap/safe-migrate.js";

type LeanPlan = {
  _id: unknown;
  slug: string;
  priceBDT?: number;
  priceYearly?: number;
  isCustomPrice?: boolean;
  pricing?: Record<string, number>;
};

export async function getPlatformPaymentMethods() {
  await connectDatabase();
  await ensurePlatformPaymentMethodsSafe();
  const methods = await PlatformPaymentMethodModel.find({ enabled: true }).sort({ sortOrder: 1 }).lean();
  return { ok: true as const, data: { methods } };
}

export async function getAllPlatformPaymentMethods() {
  await connectDatabase();
  await ensurePlatformPaymentMethodsSafe();
  const methods = await PlatformPaymentMethodModel.find().sort({ sortOrder: 1 }).lean();
  return { ok: true as const, data: { methods } };
}

export async function updatePlatformPaymentMethod(
  type: string,
  adminUserId: string,
  payload: unknown
) {
  const parsed = updatePlatformPaymentMethodSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid payment method data" };

  await connectDatabase();
  const method = await PlatformPaymentMethodModel.findOneAndUpdate(
    { type },
    { $set: { ...parsed.data, updatedBy: adminUserId } },
    { new: true, upsert: true }
  ).lean();

  return { ok: true as const, data: { method } };
}

export async function submitStoreSubscriptionPayment(
  storeId: string,
  userId: string,
  payload: unknown
) {
  const parsed = submitSubscriptionPaymentSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Invalid payment submission" };

  await connectDatabase();
  const settings = await getPlatformSettings();
  const store = await StoreModel.findOne({ _id: storeId, userId });
  if (!store) return { ok: false as const, message: "Store not found" };

  const plan = (await PlanModel.findById(parsed.data.planId).lean()) as LeanPlan | null;
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const duration = parsed.data.duration as SubscriptionDuration;
  const enabledDurations = settings.enabledDurations ?? {};
  const durationSettingKey = duration === "half_yearly" ? "halfYearly" : duration;
  if (enabledDurations[durationSettingKey as keyof typeof enabledDurations] === false) {
    return { ok: false as const, message: "Selected billing duration is not available" };
  }

  const expectedAmount = getPlanPriceForDuration(plan, duration);
  if (!plan.isCustomPrice && Math.abs(parsed.data.amount - expectedAmount) > 1) {
    return { ok: false as const, message: "Payment amount does not match plan price for selected duration" };
  }

  const payment = await SubscriptionPaymentModel.create({
    tenantId: store.tenantId,
    storeId: store._id,
    userId,
    planId: plan._id,
    duration,
    amount: parsed.data.amount,
    paymentMethod: parsed.data.paymentMethod,
    senderNumber: parsed.data.senderNumber,
    transactionId: parsed.data.transactionId,
    paymentDate: parsed.data.paymentDate ? new Date(parsed.data.paymentDate) : new Date(),
    screenshotUrl: parsed.data.screenshotUrl ?? "",
    notes: parsed.data.notes ?? "",
    status: "pending",
    expiresAt: addDays(new Date(), 7),
  });

  store.status = "pending_payment";
  store.billingStatus = "past_due";
  await store.save();

  await createBillingNotification({
    userId,
    storeId,
    type: "payment_submitted",
    title: "Payment submitted",
    message: `Your payment for "${store.name}" is pending admin approval.`,
    metadata: { paymentId: String(payment._id), planSlug: plan.slug, duration },
  });

  return { ok: true as const, data: { payment: payment.toObject() } };
}

export async function getStoreSubscriptionPayments(storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const payments = await SubscriptionPaymentModel.find({ storeId })
    .populate("planId", "name slug priceBDT priceYearly")
    .sort({ createdAt: -1 })
    .lean();

  return { ok: true as const, data: { payments } };
}

export async function listSubscriptionPayments(status?: string) {
  await connectDatabase();
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const payments = await SubscriptionPaymentModel.find(filter)
    .populate("storeId", "name slug subdomain")
    .populate("userId", "name email")
    .populate("planId", "name slug priceBDT priceYearly")
    .populate("tenantId", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return { ok: true as const, data: { payments } };
}

export async function approveSubscriptionPayment(
  paymentId: string,
  adminUserId: string,
  payload: unknown
) {
  const parsed = approvePaymentSchema.safeParse(payload ?? {});
  if (!parsed.success) return { ok: false as const, message: "Invalid approval data" };

  await connectDatabase();
  const payment = await SubscriptionPaymentModel.findById(paymentId);
  if (!payment) return { ok: false as const, message: "Payment not found" };
  if (payment.status !== "pending") return { ok: false as const, message: "Payment is not pending" };

  const plan = (await PlanModel.findById(payment.planId).lean()) as LeanPlan | null;
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const duration = (payment.duration ?? "monthly") as SubscriptionDuration;
  const startDate = new Date();
  const expireDate = parsed.data.subscriptionExpireDate
    ? new Date(parsed.data.subscriptionExpireDate)
    : calculateSubscriptionExpireDate(startDate, duration);

  payment.status = "approved";
  payment.approvedBy = adminUserId as never;
  payment.approvedAt = new Date();
  payment.subscriptionExpireDate = expireDate ?? undefined;
  await payment.save();

  await StoreModel.updateOne(
    { _id: payment.storeId },
    {
      $set: {
        plan: plan.slug,
        planId: plan._id,
        subscriptionDuration: duration,
        subscriptionStartDate: startDate,
        billingStatus: "active",
        subscriptionStatus: "active",
        renewalDate: expireDate,
        status: "active",
        published: true,
        allowNewOrders: true,
      },
    }
  );

  const subscription = await activateStoreSubscription({
    tenantId: String(payment.tenantId),
    storeId: String(payment.storeId),
    userId: String(payment.userId),
    planId: String(payment.planId),
    duration,
    amount: payment.amount,
    paymentId: String(payment._id),
    startDate,
  });

  const invoice = await createInvoice({
    tenantId: String(payment.tenantId),
    storeId: String(payment.storeId),
    userId: String(payment.userId),
    planId: String(payment.planId),
    subscriptionId: String(subscription._id),
    paymentId: String(payment._id),
    duration,
    subtotal: payment.amount,
  });

  await createBillingNotification({
    userId: String(payment.userId),
    storeId: String(payment.storeId),
    type: "payment_approved",
    title: "Payment approved",
    message: `Your subscription payment was approved. Invoice ${invoice.invoiceNumber} has been generated.`,
    metadata: { paymentId: String(payment._id), invoiceId: String(invoice._id) },
  });

  return { ok: true as const, data: { payment: payment.toObject(), invoice } };
}

export async function rejectSubscriptionPayment(
  paymentId: string,
  adminUserId: string,
  payload: unknown
) {
  const parsed = rejectPaymentSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, message: "Rejection reason required" };

  await connectDatabase();
  const payment = await SubscriptionPaymentModel.findById(paymentId);
  if (!payment) return { ok: false as const, message: "Payment not found" };
  if (payment.status !== "pending") return { ok: false as const, message: "Payment is not pending" };

  payment.status = "rejected";
  payment.approvedBy = adminUserId as never;
  payment.approvedAt = new Date();
  payment.rejectedReason = parsed.data.reason;
  await payment.save();

  await StoreModel.updateOne(
    { _id: payment.storeId },
    { $set: { status: "pending_payment", billingStatus: "past_due" } }
  );

  await createBillingNotification({
    userId: String(payment.userId),
    storeId: String(payment.storeId),
    type: "payment_rejected",
    title: "Payment rejected",
    message: `Your subscription payment was rejected. Reason: ${parsed.data.reason}`,
    metadata: { paymentId: String(payment._id), reason: parsed.data.reason },
  });

  return { ok: true as const, data: { payment: payment.toObject() } };
}
