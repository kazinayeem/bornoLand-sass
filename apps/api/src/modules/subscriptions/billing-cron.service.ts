import { StoreModel } from "../../models/store.model.js";
import { StoreSubscriptionModel } from "../../models/store-subscription.model.js";
import { BillingNotificationModel } from "../../models/billing-notification.model.js";
import { connectDatabase } from "../../common/database/connection.js";

export async function runBillingCron() {
  await connectDatabase();
  const now = new Date();
  const results = {
    expiredTrials: 0,
    expiredSubscriptions: 0,
    notifications: 0,
  };

  // ── 1. Expire trials that have ended ──────────────────────────────
  const expiredTrialStores = await StoreModel.find({
    billingStatus: "trial",
    subscriptionStatus: "trialing",
    trialEndsAt: { $lte: now },
  }).lean() as Array<Record<string, unknown>>;

  for (const store of expiredTrialStores) {
    await StoreModel.updateOne(
      { _id: store._id as any },
      {
        $set: {
          billingStatus: "past_due",
          subscriptionStatus: "past_due",
          status: "expired",
          published: false,
          allowNewOrders: false,
        },
      }
    );
    await StoreSubscriptionModel.updateMany(
      { storeId: store._id, status: "trial" },
      { $set: { status: "expired" } }
    );
    results.expiredTrials++;
  }

  // ── 2. Expire subscriptions that have ended ───────────────────────
  const expiredSubscriptions = await StoreSubscriptionModel.find({
    status: "active",
    expireDate: { $lte: now },
  }).lean();

  for (const sub of expiredSubscriptions) {
    const store = await StoreModel.findById(sub.storeId).lean() as Record<string, unknown> | null;
    if (!store) continue;

    const trialCheck = store.trialEndsAt && new Date(store.trialEndsAt as string) > now;
    if (trialCheck) continue;

    await StoreSubscriptionModel.updateOne(
      { _id: sub._id },
      { $set: { status: "expired" } }
    );
    await StoreModel.updateOne(
      { _id: sub.storeId },
      {
        $set: {
          billingStatus: "past_due",
          subscriptionStatus: "past_due",
          status: "expired",
          published: false,
          allowNewOrders: false,
        },
      }
    );
    results.expiredSubscriptions++;
  }

  // ── 3. Send trial expiry notifications ────────────────────────────
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const trialingSoon = await StoreModel.find({
    billingStatus: "trial",
    subscriptionStatus: "trialing",
    trialEndsAt: {
      $gte: now,
      $lte: sevenDaysFromNow,
    },
  }).lean() as Array<Record<string, unknown>>;

  for (const store of trialingSoon) {
    const trialEndsAt = store.trialEndsAt as string | undefined;
    if (!trialEndsAt) continue;
    const remainingMs = new Date(trialEndsAt).getTime() - now.getTime();
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    if (remainingDays <= 7 && remainingDays > 3) {
      const exists = await BillingNotificationModel.findOne({
        storeId: store._id as any,
        type: "trial_ending_soon_7",
      }).lean();
      if (!exists) {
        await BillingNotificationModel.create([{
          storeId: store._id as any,
          userId: store.userId as any,
          type: "trial_ending_soon_7",
          title: "Trial ending soon",
          message: `Your trial ends in ${remainingDays} days. Upgrade to keep your store active.`,
        }] as any);
        results.notifications++;
      }
    }

    if (remainingDays <= 3 && remainingDays > 0) {
      const exists = await BillingNotificationModel.findOne({
        storeId: store._id as any,
        type: "trial_ending_soon_3",
      }).lean();
      if (!exists) {
        await BillingNotificationModel.create([{
          storeId: store._id as any,
          userId: store.userId as any,
          type: "trial_ending_soon_3",
          title: "Trial ending in 3 days",
          message: `Your trial ends in ${remainingDays} days. Upgrade now to avoid disruption.`,
        }] as any);
        results.notifications++;
      }
    }
  }

  return results;
}

export function startBillingCronScheduler() {
  // Run every hour
  const INTERVAL_MS = 60 * 60 * 1000;

  const run = async () => {
    try {
      const result = await runBillingCron();
      if (result.expiredTrials > 0 || result.expiredSubscriptions > 0 || result.notifications > 0) {
        console.log(`[BillingCron] Expired: ${result.expiredTrials} trials, ${result.expiredSubscriptions} subscriptions. Sent ${result.notifications} notifications.`);
      }
    } catch (error) {
      console.error("[BillingCron] Error:", error);
    }
  };

  // Run immediately on start
  run();

  // Then run on interval
  setInterval(run, INTERVAL_MS);
}
