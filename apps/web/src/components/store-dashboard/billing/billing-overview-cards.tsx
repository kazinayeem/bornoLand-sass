"use client";

import type { DashboardStatsResponse, SubscriptionDashboardResponse } from "@/redux/api/subscription-api";
import {
  CreditCard,
  Database,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Wifi,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatBDT, resolveStoreStatus } from "@/lib/store-status";

type Props = {
  stats?: DashboardStatsResponse;
  subscription?: {
    store: SubscriptionDashboardResponse["store"];
    plan: SubscriptionDashboardResponse["plan"];
  };
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
    active: { label: "Active", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    trial: { label: "Trial", classes: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    trialing: { label: "Trial", classes: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    past_due: { label: "Past Due", classes: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
    expired: { label: "Expired", classes: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
    pending_payment: { label: "Pending Payment", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    pending_approval: { label: "Pending Approval", classes: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  };
  const c = config[status] || { label: status, classes: "bg-apple-canvas-parchment text-apple-ink-muted-80 border-apple-hairline", icon: CheckCircle2 };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${c.classes}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  status,
}: {
  icon: typeof CreditCard;
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  status?: string;
}) {
  return (
    <div className="rounded-apple-lg border border-apple-hairline bg-white p-5  transition-all hover:">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-canvas-parchment text-apple-ink-muted-80 ring-1 ring-zinc-100">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-apple-ink-muted-48">{label}</p>
            <p className="text-xl font-bold tracking-tight text-apple-ink">{value}</p>
          </div>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      {subtext && (
        <div className="mt-3 flex items-center gap-2 border-t border-apple-divider-soft pt-3">
          <span className="text-xs text-apple-ink-muted-48">{subtext}</span>
          {trend === "up" && <span className="text-[11px] font-medium text-emerald-600">↑ Improving</span>}
          {trend === "down" && <span className="text-[11px] font-medium text-red-600">↓ Needs attention</span>}
        </div>
      )}
    </div>
  );
}

export function BillingOverviewCards({ stats, subscription }: Props) {
  const store = subscription?.store;
  const subPlan = subscription?.plan;

  const currentStorage = stats?.storage?.usedFormatted ?? "0 MB";
  const storageLimit = stats?.storage?.limitFormatted ?? "0 MB";
  const storagePercent = stats?.storage?.percent ?? 0;
  const storageRemaining = stats?.storage?.remainingMB ?? 0;

  const productsUsage = stats?.usage?.find((u) => u.key === "products")?.current ?? 0;
  const productsLimit = stats?.usage?.find((u) => u.key === "products")?.limit ?? 0;
  const ordersUsage = stats?.usage?.find((u) => u.key === "orders")?.current ?? 0;
  const ordersLimit = stats?.usage?.find((u) => u.key === "orders")?.limit ?? 0;
  const staffUsage = stats?.usage?.find((u) => u.key === "staff")?.current ?? 0;
  const staffLimit = stats?.usage?.find((u) => u.key === "staff")?.limit ?? 0;

  const billingStatus = store?.billingStatus ?? "unknown";
  const subStatus = store?.subscriptionStatus ?? "unknown";
  const overallStatus = store ? resolveStoreStatus(store as any) : "active";

  const renewalDate = store?.renewalDate || store?.trialEndsAt;
  const daysRemaining = renewalDate
    ? Math.max(0, Math.ceil((new Date(renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const isLowStorage = storageRemaining < 50 && storageRemaining > 0;
  const isCritical = overallStatus === "expired" || overallStatus === "suspended";
  const isPending = overallStatus === "pending_payment" || overallStatus === "pending_approval";

  return (
    <div className="space-y-4">
      {/* Status banner for non-active stores */}
      {isCritical && (
        <div className="rounded-apple-lg border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 ">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">Subscription {overallStatus === "expired" ? "Expired" : "Suspended"}</h3>
              <p className="text-sm text-red-700 mt-0.5">
                Your store is in read-only mode. Renew your subscription to restore full access.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <div className="rounded-apple-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 ">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Payment Pending Approval</h3>
              <p className="text-sm text-amber-700 mt-0.5">
                An admin will review your payment shortly. Estimated review time: 2-24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overview grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={CreditCard}
          label="Current Plan"
          value={subPlan?.name || "Free"}
          subtext={`Billing: ${billingStatus}`}
          status={billingStatus}
        />
        <StatCard
          icon={Calendar}
          label={daysRemaining !== null && daysRemaining > 0 ? "Renewal Date" : "Status"}
          value={renewalDate ? new Date(renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
          subtext={daysRemaining !== null ? `${daysRemaining} days remaining` : ""}
          trend={daysRemaining !== null && daysRemaining <= 7 ? "down" : daysRemaining !== null ? "up" : undefined}
        />
        <StatCard
          icon={HardDrive}
          label="Storage"
          value={`${currentStorage} / ${storageLimit}`}
          subtext={`${storagePercent.toFixed(1)}% used · ${storageRemaining.toFixed(0)} MB remaining`}
          trend={isLowStorage ? "down" : "neutral"}
        />
        <StatCard
          icon={Package}
          label="Products"
          value={productsUsage.toString()}
          subtext={productsLimit > 0 ? `Limit: ${productsLimit}` : "No limit"}
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders"
          value={ordersUsage.toString()}
          subtext={ordersLimit > 0 ? `Limit: ${ordersLimit}` : "No limit"}
        />
        <StatCard
          icon={Users}
          label="Staff"
          value={staffUsage.toString()}
          subtext={staffLimit > 0 ? `Limit: ${staffLimit}` : "No limit"}
        />
      </div>

      {/* Subscription details card */}
      <div className="rounded-apple-lg border border-apple-hairline bg-white p-5 ">
        <h3 className="text-sm font-semibold text-apple-ink mb-4">Subscription Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Billing Cycle", value: store?.subscriptionDuration ? store.subscriptionDuration.replace("_", " ") : "—" },
            { label: "Payment Status", value: billingStatus.replace("_", " ") },
            { label: "Subscription Status", value: subStatus.replace("_", " ") },
            { label: "Store Status", value: overallStatus.replace("_", " ") },
            {
              label: "Created",
              value: (store as any)?.createdAt
                ? new Date((store as any).createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—",
            },
            {
              label: "Renewal Date",
              value: renewalDate
                ? new Date(renewalDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—",
            },
            { label: "Days Remaining", value: daysRemaining !== null ? `${daysRemaining}d` : "—" },
            {
              label: "Plan Price",
              value: subPlan?.priceBDT ? formatBDT(subPlan.priceBDT) : "—",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-apple-canvas-parchment p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-apple-ink-muted-48">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-apple-ink capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
