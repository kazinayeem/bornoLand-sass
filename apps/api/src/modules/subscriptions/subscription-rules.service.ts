import { connectDatabase } from "../../common/database/connection.js";
import { StoreModel } from "../../models/store.model.js";

export type SubscriptionAction =
  | "login"
  | "view_dashboard"
  | "view_orders"
  | "export_data"
  | "create_products"
  | "update_products"
  | "delete_products"
  | "upload_media"
  | "edit_theme"
  | "publish_pages"
  | "invite_staff"
  | "change_settings"
  | "api_access"
  | "view_analytics"
  | "create_orders";

const EXPIRED_ALLOWED: SubscriptionAction[] = [
  "login",
  "view_dashboard",
  "view_orders",
  "export_data",
  "create_orders",
];

const TRIAL_ALLOWED: SubscriptionAction[] = [
  "login",
  "view_dashboard",
  "view_orders",
  "export_data",
  "create_products",
  "update_products",
  "delete_products",
  "upload_media",
  "edit_theme",
  "publish_pages",
  "invite_staff",
  "change_settings",
  "api_access",
  "view_analytics",
  "create_orders",
];

const ACTIVE_ALLOWED: SubscriptionAction[] = [
  "login",
  "view_dashboard",
  "view_orders",
  "export_data",
  "create_products",
  "update_products",
  "delete_products",
  "upload_media",
  "edit_theme",
  "publish_pages",
  "invite_staff",
  "change_settings",
  "api_access",
  "view_analytics",
  "create_orders",
];

const PENDING_ALLOWED: SubscriptionAction[] = [
  "login",
  "view_dashboard",
  "view_orders",
  "export_data",
];

const SUSPENDED_ALLOWED: SubscriptionAction[] = [
  "login",
  "view_dashboard",
];

type StoreStatus = "trial" | "active" | "expired" | "pending_payment" | "pending_approval" | "suspended" | "draft";

export function getAllowedActions(status: StoreStatus): SubscriptionAction[] {
  switch (status) {
    case "active":
      return ACTIVE_ALLOWED;
    case "trial":
      return TRIAL_ALLOWED;
    case "expired":
      return EXPIRED_ALLOWED;
    case "pending_payment":
    case "pending_approval":
      return PENDING_ALLOWED;
    case "suspended":
      return SUSPENDED_ALLOWED;
    default:
      return ACTIVE_ALLOWED;
  }
}

export function isActionAllowed(status: StoreStatus, action: SubscriptionAction): boolean {
  return getAllowedActions(status).includes(action);
}

export async function getEffectiveStoreStatus(storeId: string): Promise<StoreStatus> {
  await connectDatabase();
  const store = await StoreModel.findById(storeId)
    .select("status billingStatus subscriptionStatus trialEndsAt")
    .lean() as {
    _id: unknown;
    status?: string;
    billingStatus?: string;
    subscriptionStatus?: string;
    trialEndsAt?: Date | null;
  } | null;

  if (!store) return "draft";

  if (store.status === "suspended") return "suspended";
  if (store.status === "pending_payment") return "pending_payment";
  if (store.status === "pending_approval") return "pending_approval";

  const billing = store.billingStatus;
  const sub = store.subscriptionStatus;

  if (billing === "trial" || sub === "trialing") {
    if (store.trialEndsAt && new Date(store.trialEndsAt).getTime() < Date.now()) {
      return "expired";
    }
    return "trial";
  }

  if (billing === "past_due" || billing === "cancelled" || sub === "cancelled") {
    return "expired";
  }

  if (store.status === "expired") return "expired";

  if (billing === "active" || sub === "active" || store.status === "active") {
    return "active";
  }

  return "draft";
}

export function getStoreStatusFromRecord(store: {
  status?: string;
  billingStatus?: string;
  subscriptionStatus?: string;
  trialEndsAt?: Date | string | null;
}): StoreStatus {
  if (store.status === "suspended") return "suspended";
  if (store.status === "pending_payment") return "pending_payment";
  if (store.status === "pending_approval") return "pending_approval";
  if (store.status === "archived") return "suspended";

  const billing = store.billingStatus;
  const sub = store.subscriptionStatus;

  if (billing === "trial" || sub === "trialing") {
    if (store.trialEndsAt && new Date(store.trialEndsAt).getTime() < Date.now()) {
      return "expired";
    }
    return "trial";
  }
  if (billing === "past_due" || billing === "cancelled" || sub === "cancelled") return "expired";
  if (store.status === "expired") return "expired";
  if (billing === "active" || sub === "active" || store.status === "active") return "active";
  return "draft";
}
