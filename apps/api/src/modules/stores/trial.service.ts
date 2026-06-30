import { StoreModel } from "../../models/store.model.js";
import { addDays, isTrialExpired } from "../../common/utils/store-trial.js";
import { getTrialConfig } from "../settings/platform-settings.service.js";
import { expireStoreSubscription } from "../subscriptions/store-subscription.service.js";

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

  await expireStoreSubscription(String(store._id));
  return store;
}

export async function hydrateStoreTrialState(storeId: string) {
  const store = await StoreModel.findById(storeId);
  if (!store) return null;
  await applyTrialExpiryToStore(store);
  return store;
}

export async function buildTrialFields() {
  const trialConfig = await getTrialConfig();
  const trialStartedAt = new Date();

  if (!trialConfig.enabled) {
    return {
      trialStartedAt: null,
      trialEndsAt: null,
      billingStatus: "active" as const,
      subscriptionStatus: "active" as const,
      renewalDate: null,
      published: true,
      allowNewOrders: true,
      status: "active" as const,
      subscriptionStartDate: trialStartedAt,
    };
  }

  const trialEndsAt = addDays(trialStartedAt, trialConfig.days);
  return {
    trialStartedAt,
    trialEndsAt,
    billingStatus: "trial" as const,
    subscriptionStatus: "trialing" as const,
    renewalDate: trialEndsAt,
    published: true,
    allowNewOrders: true,
    status: "active" as const,
    subscriptionStartDate: trialStartedAt,
  };
}

export async function applySubscriptionExpiryToStore(store: {
  _id: unknown;
  billingStatus?: string;
  subscriptionStatus?: string;
  renewalDate?: Date | null;
  status?: string;
  published?: boolean;
  allowNewOrders?: boolean;
  save?: () => Promise<unknown>;
}) {
  const expired =
    store.billingStatus === "active" &&
    store.subscriptionStatus === "active" &&
    store.renewalDate &&
    isTrialExpired(store.renewalDate);

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

  await expireStoreSubscription(String(store._id));
  return store;
}
