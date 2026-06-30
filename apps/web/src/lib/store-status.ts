import type { Store } from "@/redux/api/store-api";
import { getStoreDisplayDomain, getStoreUrlFromRecord } from "@/lib/urls";

export type StoreStatus =
  | "trial"
  | "pending_payment"
  | "pending_approval"
  | "active"
  | "expired"
  | "suspended"
  | "archived"
  | "draft";

export function resolveStoreStatus(store: Store): StoreStatus {
  if (store.status === "archived") return "archived";
  if (store.status === "suspended") return "suspended";
  if (store.status === "expired") return "expired";
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
  if (billing === "past_due") return "pending_payment";
  if (billing === "cancelled" || sub === "cancelled") return "expired";
  if (billing === "active" || sub === "active") return "active";

  return store.status === "active" ? "active" : "draft";
}

export function getTrialDaysRemaining(trialEndsAt?: string | null) {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export const storeStatusConfig: Record<
  StoreStatus,
  { label: string; variant: "success" | "warning" | "danger" | "primary" | "violet" | "default" | "slate" }
> = {
  trial: { label: "Trial", variant: "primary" },
  pending_payment: { label: "Pending Payment", variant: "warning" },
  pending_approval: { label: "Pending Approval", variant: "violet" },
  active: { label: "Active", variant: "success" },
  expired: { label: "Expired", variant: "danger" },
  suspended: { label: "Suspended", variant: "warning" },
  archived: { label: "Archived", variant: "slate" },
  draft: { label: "Draft", variant: "default" },
};

export function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function getStoreUrl(store: Pick<Store, "subdomain" | "slug">) {
  return getStoreUrlFromRecord(store);
}

export { getStoreDisplayDomain };
