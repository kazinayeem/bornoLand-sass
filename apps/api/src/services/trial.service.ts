import { StoreModel } from "../models/store.model.js";
import { STORE_TRIAL_DAYS, addDays, isTrialExpired } from "../utils/store-trial.js";

export async function applyTrialExpiryToStore(store: {
  _id: unknown;
  billingStatus?: string;
  subscriptionStatus?: string;
  trialEndsAt?: Date | null;
  status?: string;
  published?: boolean;
  allowNewOrders?: boolean;
  save?: () => Promise<unknown>;
}) {
  const expired =
    store.billingStatus === "trial" &&
    store.subscriptionStatus === "trialing" &&
    isTrialExpired(store.trialEndsAt ?? undefined);

  if (!expired) return store;

  store.billingStatus = "past_due";
  store.subscriptionStatus = "past_due";
  store.status = "expired";
  store.published = false;
  store.allowNewOrders = false;

  if (typeof store.save === "function") {
    await store.save();
  } else {
    await StoreModel.updateOne(
      { _id: store._id },
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
  }

  return store;
}

export async function hydrateStoreTrialState(storeId: string) {
  const store = await StoreModel.findById(storeId);
  if (!store) return null;
  await applyTrialExpiryToStore(store);
  return store;
}

export function buildTrialFields() {
  const trialStartedAt = new Date();
  const trialEndsAt = addDays(trialStartedAt, STORE_TRIAL_DAYS);
  return {
    trialStartedAt,
    trialEndsAt,
    billingStatus: "trial" as const,
    subscriptionStatus: "trialing" as const,
    renewalDate: trialEndsAt,
    published: true,
    allowNewOrders: true,
    status: "active" as const,
  };
}
