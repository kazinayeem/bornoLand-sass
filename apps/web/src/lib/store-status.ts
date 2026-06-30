import type { Store } from "@/redux/api/store-api";

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
  const billing = store.billingStatus;
  const sub = store.subscriptionStatus;

  if (store.status === "suspended") return "suspended";
  if (store.status === "draft") return "draft";

  if (billing === "trial" || sub === "trialing") return "trial";
  if (billing === "past_due") return "pending_payment";
  if (billing === "cancelled" || sub === "cancelled") return "expired";
  if (billing === "active" || sub === "active") return "active";

  return store.status === "active" ? "active" : "draft";
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
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornoland.com";
  const subdomain = store.subdomain || store.slug;
  if (rootDomain.includes("localhost")) {
    return `http://${subdomain}.localhost:3000`;
  }
  return `https://${subdomain}.${rootDomain}`;
}
