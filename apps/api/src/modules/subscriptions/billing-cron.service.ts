import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";
import { SubscriptionPaymentModel } from "../../models/subscription-payment.model.js";
import { StoreSubscriptionModel } from "./store-subscription.model.js";
import { addDays, isTrialExpired } from "../../common/utils/store-trial.js";
import { applyTrialExpiryToStore, applySubscriptionExpiryToStore } from "../stores/trial.service.js";
import { createBillingNotification } from "../notifications/billing-notification.service.js";
import { getRemainingDays } from "../plans/plan-pricing.util.js";

const TRIAL_WARNING_DAYS = 1;
const SUBSCRIPTION_WARNING_DAYS = 3;

export async function runBillingCron() {
  await connectDatabase();
  const now = new Date();
  const results = {
    trialsExpired: 0,
    subscriptionsExpired: 0,
    paymentsExpired: 0,
    trialWarnings: 0,
    subscriptionWarnings: 0,
  };

  const trialStores = await StoreModel.find({
    billingStatus: "trial",
    subscriptionStatus: "trialing",
    trialEndsAt: { $lte: now },
  });

  for (const store of trialStores) {
    await applyTrialExpiryToStore(store);
    await createBillingNotification({
      userId: String(store.userId),
      storeId: String(store._id),
      type: "trial_expired",
      title: "Trial expired",
      message: `Your store "${store.name}" trial has expired. Upgrade to continue publishing and accepting orders.`,
    });
    results.trialsExpired += 1;
  }

  const trialEndingSoon = await StoreModel.find({
    billingStatus: "trial",
    subscriptionStatus: "trialing",
    trialEndsAt: {
      $gt: now,
      $lte: addDays(now, TRIAL_WARNING_DAYS),
    },
  });

  for (const store of trialEndingSoon) {
    const remaining = getRemainingDays(store.trialEndsAt) ?? 0;
    await createBillingNotification({
      userId: String(store.userId),
      storeId: String(store._id),
      type: "trial_ending",
      title: "Trial ending soon",
      message: `Your store "${store.name}" trial ends in ${remaining} day(s). Upgrade to keep your store active.`,
    });
    results.trialWarnings += 1;
  }

  const activeStores = await StoreModel.find({
    billingStatus: "active",
    subscriptionStatus: "active",
    renewalDate: { $lte: now },
  });

  for (const store of activeStores) {
    await applySubscriptionExpiryToStore(store);
    await createBillingNotification({
      userId: String(store.userId),
      storeId: String(store._id),
      type: "subscription_expired",
      title: "Subscription expired",
      message: `Your store "${store.name}" subscription has expired. Renew to restore full access.`,
    });
    results.subscriptionsExpired += 1;
  }

  const expiringSoon = await StoreModel.find({
    billingStatus: "active",
    subscriptionStatus: "active",
    renewalDate: {
      $gt: now,
      $lte: addDays(now, SUBSCRIPTION_WARNING_DAYS),
    },
  });

  for (const store of expiringSoon) {
    const remaining = getRemainingDays(store.renewalDate) ?? 0;
    await createBillingNotification({
      userId: String(store.userId),
      storeId: String(store._id),
      type: "subscription_expiring",
      title: "Subscription expiring soon",
      message: `Your store "${store.name}" subscription expires in ${remaining} day(s).`,
    });
    results.subscriptionWarnings += 1;
  }

  const expiredPayments = await SubscriptionPaymentModel.updateMany(
    { status: "pending", expiresAt: { $lte: now } },
    { $set: { status: "expired" } }
  );
  results.paymentsExpired = expiredPayments.modifiedCount ?? 0;

  await StoreSubscriptionModel.updateMany(
    { status: { $in: ["trial", "active"] }, expireDate: { $lte: now } },
    { $set: { status: "expired" } }
  );

  return results;
}

export function startBillingCronScheduler() {
  const dayMs = 24 * 60 * 60 * 1000;
  const run = () => {
    void runBillingCron().catch((error) => {
      console.error("[billing-cron] failed", error);
    });
  };

  run();
  setInterval(run, dayMs);
  console.log("[billing-cron] scheduler started (daily)");
}
