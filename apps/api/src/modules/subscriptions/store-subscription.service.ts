import { connectDatabase } from "../../common/database/connection.js";
import { StoreSubscriptionModel } from "./store-subscription.model.js";
import { calculateSubscriptionExpireDate, getRemainingDays } from "../plans/plan-pricing.util.js";
import type { SubscriptionDuration } from "./subscription.constants.js";

export async function createTrialSubscription(input: {
  tenantId: string;
  storeId: string;
  userId: string;
  planId: string;
  trialEndsAt: Date;
  trialStartedAt: Date;
}) {
  await connectDatabase();
  const subscription = await StoreSubscriptionModel.create({
    tenantId: input.tenantId,
    storeId: input.storeId,
    userId: input.userId,
    planId: input.planId,
    duration: "monthly",
    amount: 0,
    status: "trial",
    isTrial: true,
    startDate: input.trialStartedAt,
    expireDate: input.trialEndsAt,
    renewDate: input.trialEndsAt,
  });
  return subscription.toObject();
}

export async function activateStoreSubscription(input: {
  tenantId: string;
  storeId: string;
  userId: string;
  planId: string;
  duration: SubscriptionDuration;
  amount: number;
  paymentId?: string;
  startDate?: Date;
}) {
  await connectDatabase();
  const startDate = input.startDate ?? new Date();
  const expireDate = calculateSubscriptionExpireDate(startDate, input.duration);

  await StoreSubscriptionModel.updateMany(
    { storeId: input.storeId, status: { $in: ["trial", "active", "pending_payment", "pending_approval"] } },
    { $set: { status: "cancelled" } }
  );

  const subscription = await StoreSubscriptionModel.create({
    tenantId: input.tenantId,
    storeId: input.storeId,
    userId: input.userId,
    planId: input.planId,
    duration: input.duration,
    amount: input.amount,
    status: "active",
    isTrial: false,
    startDate,
    expireDate,
    renewDate: expireDate,
    paymentId: input.paymentId,
  });

  return subscription.toObject();
}

export async function getStoreSubscription(storeId: string) {
  await connectDatabase();
  const subscription = await StoreSubscriptionModel.findOne({
    storeId,
    status: { $in: ["trial", "active", "pending_payment", "pending_approval", "expired"] },
  })
    .sort({ createdAt: -1 })
    .populate("planId", "name slug priceBDT priceYearly features limits")
    .lean();

  if (!subscription) return { ok: true as const, data: { subscription: null, remainingDays: null } };

  const sub = subscription as { expireDate?: Date | string | null };
  const remainingDays = getRemainingDays(sub.expireDate);
  return { ok: true as const, data: { subscription, remainingDays } };
}

export async function expireStoreSubscription(storeId: string) {
  await connectDatabase();
  await StoreSubscriptionModel.updateMany(
    { storeId, status: { $in: ["trial", "active"] } },
    { $set: { status: "expired" } }
  );
}
