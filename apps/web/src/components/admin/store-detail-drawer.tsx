"use client";

import Link from "next/link";
import { Ban, CheckCircle, CreditCard, ExternalLink, Package, ShoppingBag, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import type { AdminStore } from "@/redux/api/admin-api";
import type { Plan } from "@/redux/api/store-api";
import { StorePlanOverridePanel } from "@/components/admin/stores/store-plan-override-panel";
import { formatCurrency } from "@/lib/format-currency";
import { Badge } from "@/components/ui/badge";

export function StoreDetailDrawer({
  store,
  plans,
  open,
  onClose,
  onSuspend,
  onActivate,
  onDelete,
  onChangePlan,
}: {
  store: AdminStore | null;
  plans: Plan[];
  open: boolean;
  onClose: () => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onChangePlan: (storeId: string, planId: string, planName: string) => void;
}) {
  if (!store) return null;

  const planName =
    typeof store.planId === "object" && store.planId
      ? (store.planId as { name?: string }).name
      : store.plan ?? "—";

  return (
    <Drawer open={open} onClose={onClose} title={store.name} description={`/${store.slug}`} size="full">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant={store.status === "active" ? "success" : "warning"}>{store.status}</Badge>
          <Badge variant="primary">{planName}</Badge>
          {store.billingStatus && <Badge>{store.billingStatus}</Badge>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard label="Owner" value={store.userId?.email ?? "—"} sub={store.userId?.name} />
          <InfoCard label="Subdomain" value={store.subdomain} />
          <InfoCard
            label="Trial ends"
            value={store.renewalDate ? new Date(store.renewalDate).toLocaleDateString() : "—"}
          />
          <InfoCard label="Revenue" value={formatCurrency(store.revenueBDT ?? 0)} />
          <InfoCard label="Products" value={String(store.productCount ?? 0)} icon={Package} />
          <InfoCard label="Orders" value={String(store.orderCount ?? 0)} icon={ShoppingBag} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Change plan</label>
          <select
            className="h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            value={typeof store.planId === "string" ? store.planId : ""}
            onChange={(e) => {
              const plan = plans.find((p) => p._id === e.target.value);
              if (plan) onChangePlan(store._id, plan._id, plan.name);
            }}
          >
            <option value="">Select plan</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>

        <StorePlanOverridePanel store={store} plans={plans} />

        <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          {store.status === "active" ? (
            <ActionButton icon={Ban} label="Suspend" onClick={() => onSuspend(store._id)} danger />
          ) : (
            <ActionButton icon={CheckCircle} label="Activate" onClick={() => onActivate(store._id)} />
          )}
          <ActionButton icon={CreditCard} label="Billing" href={`/admin/dashboard/payments`} />
          <ActionButton
            icon={ExternalLink}
            label="View storefront"
            href={`/site/${store.slug}`}
            external
          />
          <ActionButton icon={Trash2} label="Delete" onClick={() => onDelete(store._id)} danger />
        </div>
      </div>
    </Drawer>
  );
}

function InfoCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <p className="mt-1 font-semibold text-zinc-900">{value}</p>
      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  href,
  external,
  danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  danger?: boolean;
}) {
  const className = `inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${
    danger
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
  }`;

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        className={className}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
