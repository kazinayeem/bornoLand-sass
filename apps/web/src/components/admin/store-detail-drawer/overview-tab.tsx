"use client";

import { Globe, Package, ShoppingBag, Users, HardDrive, CreditCard, Calendar, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TabHelpers } from "./types";

export function OverviewTab({ helpers }: { helpers: TabHelpers }) {
  const { store, settingsData } = helpers;
  if (!store) return null;

  const usage = settingsData?.usage;
  const storeObj = store as Record<string, unknown>;
  const owner = storeObj.userId as { name?: string; email?: string } | undefined;

  const infoCards = [
    { label: "Owner", value: owner?.name ?? "—", sub: owner?.email },
    { label: "Store ID", value: store._id, mono: true },
    { label: "Slug", value: `/${store.slug}` },
    { label: "Subdomain", value: store.subdomain || "—" },
    { label: "Custom Domain", value: "—" },
    { label: "Plan", value: (storeObj.planId as { name?: string })?.name ?? store.plan ?? "—" },
    {
      label: "Subscription",
      value: store.billingStatus ?? "—",
      badge: store.billingStatus === "active" ? "success" : store.billingStatus === "trial" ? "warning" : "error" as const,
    },
    {
      label: "Status",
      value: store.status ?? "—",
      badge: store.status === "active" ? "success" : "error" as const,
    },
    { label: "Trial Status", value: store.subscriptionStatus ?? "—" },
    { label: "Created", value: new Date(store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
    { label: "Last Login", value: "—" },
  ];

  const statCards = [
    { label: "Storage Used", value: usage?.storageUsedFormatted ?? "—", icon: HardDrive },
    { label: "Total Revenue", value: `$${statsValue("revenue")}`, icon: DollarSign },
    { label: "Total Orders", value: String(usage?.orders ?? 0), icon: ShoppingBag },
    { label: "Products", value: String(usage?.products ?? 0), icon: Package },
    { label: "Customers", value: String(usage?.customers ?? 0), icon: Users },
    { label: "Staff", value: String(usage?.staff ?? 0), icon: Users },
    { label: "Media Files", value: String(usage?.media ?? 0), icon: HardDrive },
    { label: "Builder Pages", value: String(usage?.pages ?? 0), icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Store Info Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {infoCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{card.label}</p>
            <p className={`mt-1 font-semibold text-zinc-900 ${card.mono ? "font-mono text-xs" : "text-sm"}`}>
              {card.value}
            </p>
            {card.sub && <p className="mt-0.5 text-xs text-zinc-500">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Usage Stats */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Usage Overview</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-zinc-100 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                <card.icon className="h-3.5 w-3.5" />
                {card.label}
              </div>
              <p className="mt-1 text-lg font-semibold text-zinc-900">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Bar */}
      {usage && (
        <div className="rounded-xl border border-zinc-100 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700">Storage</span>
            <span className="text-zinc-500">
              {usage.storageUsedFormatted} / {usage.storageLimitFormatted}
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className={`h-full rounded-full transition-all ${
                usage.storagePercent > 90 ? "bg-red-500" : usage.storagePercent > 70 ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(usage.storagePercent, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-zinc-400">{usage.storagePercent}% used</p>
        </div>
      )}
    </div>
  );
}

function statsValue(key: string): string {
  return "0";
}
