import { connectDatabase } from "../config/database.js";
import { SubscriptionPaymentModel } from "../models/subscription-payment.model.js";
import { PlatformPaymentMethodModel } from "../models/platform-payment-method.model.js";
import { StoreModel } from "../models/store.model.js";
import { PlanModel } from "../models/plan.model.js";
import {
  submitSubscriptionPaymentSchema,
  rejectPaymentSchema,
  approvePaymentSchema,
  updatePlatformPaymentMethodSchema,
} from "../validators/subscription-payment.validator.js";
import { addDays } from "../utils/store-trial.js";

const defaultPlatformMethods = [
  { type: "bkash", label: "bKash", accountNumber: "01XXXXXXXXX", sortOrder: 1 },
  { type: "nagad", label: "Nagad", accountNumber: "01XXXXXXXXX", sortOrder: 2 },
  { type: "rocket", label: "Rocket", accountNumber: "01XXXXXXXXX", sortOrder: 3 },
  {
    type: "bank",
    label: "Bank Transfer",
    accountNumber: "0000000000",
    accountName: "BornoLand Ltd",
    bankName: "Dutch Bangla Bank",
    branchName: "Gulshan",
    sortOrder: 4,
  },
] as const;

async function ensurePlatformPaymentMethods() {
  const count = await PlatformPaymentMethodModel.countDocuments();
  if (count > 0) return;
  await PlatformPaymentMethodModel.insertMany(defaultPlatformMethods);
}

export async function getPlatformPaymentMethods() {
  await connectDatabase();
  await ensurePlatformPaymentMethods();
  const methods = await PlatformPaymentMethodModel.find({ enabled: true }).sort({ sortOrder: 1 }).lean();
  return { ok: true as const, data: { methods } };
}

export async function getAllPlatformPaymentMethods() {
  await connectDatabase();
  await ensurePlatformPaymentMethods();
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
  const store = await StoreModel.findOne({ _id: storeId, userId });
  if (!store) return { ok: false as const, message: "Store not found" };

  const plan = await PlanModel.findById(parsed.data.planId).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const payment = await SubscriptionPaymentModel.create({
    tenantId: store.tenantId,
    storeId: store._id,
    userId,
    planId: plan._id,
    amount: parsed.data.amount,
    paymentMethod: parsed.data.paymentMethod,
    senderNumber: parsed.data.senderNumber,
    transactionId: parsed.data.transactionId,
    screenshotUrl: parsed.data.screenshotUrl ?? "",
    notes: parsed.data.notes ?? "",
    status: "pending",
    expiresAt: addDays(new Date(), 7),
  });

  store.status = "pending_payment";
  store.billingStatus = "past_due";
  await store.save();

  return { ok: true as const, data: { payment: payment.toObject() } };
}

export async function getStoreSubscriptionPayments(storeId: string, userId: string) {
  await connectDatabase();
  const store = await StoreModel.findOne({ _id: storeId, userId }).lean();
  if (!store) return { ok: false as const, message: "Store not found" };

  const payments = await SubscriptionPaymentModel.find({ storeId })
    .populate("planId", "name slug priceBDT")
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
    .populate("planId", "name slug priceBDT")
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

  const plan = await PlanModel.findById(payment.planId).lean();
  if (!plan) return { ok: false as const, message: "Plan not found" };

  const expireDate = parsed.data.subscriptionExpireDate
    ? new Date(parsed.data.subscriptionExpireDate)
    : addDays(new Date(), 30);

  payment.status = "approved";
  payment.approvedBy = adminUserId as never;
  payment.approvedAt = new Date();
  payment.subscriptionExpireDate = expireDate;
  await payment.save();

  await StoreModel.updateOne(
    { _id: payment.storeId },
    {
      $set: {
        plan: plan.slug,
        planId: plan._id,
        billingStatus: "active",
        subscriptionStatus: "active",
        renewalDate: expireDate,
        status: "active",
        published: true,
        allowNewOrders: true,
      },
    }
  );

  return { ok: true as const, data: { payment: payment.toObject() } };
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

  return { ok: true as const, data: { payment: payment.toObject() } };
}
