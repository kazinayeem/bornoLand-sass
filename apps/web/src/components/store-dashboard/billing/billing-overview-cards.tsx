"use client";

import type { DashboardStatsResponse, SubscriptionDashboardResponse } from "@/redux/api/subscription-api";
import { CreditCard, Database, Package, ShoppingCart, Users, Calendar } from "lucide-react";

export function BillingOverviewCards({ 
  stats, 
  subscription 
}: { 
  stats?: DashboardStatsResponse; 
  subscription?: { store: SubscriptionDashboardResponse["store"]; plan: SubscriptionDashboardResponse["plan"] };
}) {
  const store = subscription?.store;
  const subPlan = subscription?.plan;
  
  const currentStorage = stats?.storage?.usedFormatted ?? "0 MB";
  const storageLimit = stats?.storage?.limitFormatted ?? "0 MB";
  const storagePercent = stats?.storage?.percent ?? 0;

  const ordersUsage = stats?.usage?.find((u) => u.key === "orders")?.current ?? 0;
  const productsUsage = stats?.usage?.find((u) => u.key === "products")?.current ?? 0;
  const staffUsage = stats?.usage?.find((u) => u.key === "staff")?.current ?? 0;

  const cards = [
    {
      label: "Current Plan",
      value: subPlan?.name || "Free",
      subValue: store?.subscriptionStatus === "trialing" ? "Trial Active" : "Active",
      icon: CreditCard,
    },
    {
      label: "Next Renewal",
      value: store?.trialEndsAt ? new Date(store.trialEndsAt).toLocaleDateString() : "-",
      subValue: subPlan ? `${subPlan.priceBDT} ৳` : "0 ৳",
      icon: Calendar,
    },
    {
      label: "Storage Usage",
      value: `${currentStorage} / ${storageLimit}`,
      subValue: `${storagePercent.toFixed(1)}% used`,
      icon: Database,
    },
    {
      label: "Products",
      value: productsUsage.toString(),
      subValue: "Active products",
      icon: Package,
    },
    {
      label: "Orders This Month",
      value: ordersUsage.toString(),
      subValue: "Total orders",
      icon: ShoppingCart,
    },
    {
      label: "Staff Accounts",
      value: staffUsage.toString(),
      subValue: "Active staff",
      icon: Users,
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <div key={index} className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-50 text-zinc-600">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-semibold text-zinc-900">{card.value}</h3>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-100 pt-3">
            <span className="text-xs font-medium text-zinc-500">{card.subValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
