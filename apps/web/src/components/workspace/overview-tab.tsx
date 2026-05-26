"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Store, Package, ShoppingCart, CreditCard, TrendingUp,
  BarChart3, DollarSign, Users, Activity,
} from "lucide-react";
import type { Store as StoreType } from "@/redux/api/store-api";

type OverviewTabProps = {
  storeId: string;
  store: StoreType;
};

function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency", currency: "BDT", maximumFractionDigits: 0,
  }).format(value || 0);
}

export function OverviewTab({ storeId, store }: OverviewTabProps) {
  const stats = useMemo(() => [
    {
      label: "Total Products",
      value: String(store.productCount ?? 0),
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      label: "Total Orders",
      value: String(store.orderCount ?? 0),
      icon: ShoppingCart,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Revenue",
      value: formatBDT(store.revenueBDT ?? 0),
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
    {
      label: "Conversion",
      value: store.orderCount && store.productCount
        ? `${((store.orderCount / store.productCount) * 100).toFixed(1)}%`
        : "0%",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Status",
      value: store.status,
      icon: Activity,
      color: store.status === "active" ? "text-emerald-600" : "text-amber-600",
      bg: store.status === "active" ? "bg-emerald-100" : "bg-amber-100",
    },
    {
      label: "Plan",
      value: store.plan,
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ], [store]);

  const infoCards = [
    {
      title: "Store Info",
      items: [
        { label: "Name", value: store.name },
        { label: "Category", value: store.category || "—" },
        { label: "Subdomain", value: store.subdomain },
        { label: "Plan", value: store.plan },
        { label: "Description", value: store.description || "—" },
      ],
    },
    {
      title: "Activity",
      items: [
        {
          label: "Created",
          value: new Date(store.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          }),
        },
        {
          label: "Updated",
          value: new Date(store.updatedAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          }),
        },
        { label: "Products", value: String(store.productCount ?? 0) },
        { label: "Orders", value: String(store.orderCount ?? 0) },
        { label: "Revenue", value: formatBDT(store.revenueBDT ?? 0) },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {infoCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-zinc-900 mb-4">{card.title}</h3>
            <div className="space-y-3">
              {card.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-2.5">
                  <span className="text-sm text-zinc-500">{item.label}</span>
                  <span className="text-sm font-medium text-zinc-900 max-w-[60%] truncate text-right">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-base font-semibold text-zinc-900 mb-4">Quick Stats</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Products / Order</p>
              <p className="text-sm font-semibold text-zinc-900">
                {store.orderCount && store.orderCount > 0
                  ? ((store.productCount ?? 0) / store.orderCount).toFixed(1)
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Revenue / Order</p>
              <p className="text-sm font-semibold text-zinc-900">
                {store.orderCount && store.orderCount > 0
                  ? formatBDT((store.revenueBDT ?? 0) / store.orderCount)
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Revenue / Product</p>
              <p className="text-sm font-semibold text-zinc-900">
                {store.productCount && store.productCount > 0
                  ? formatBDT((store.revenueBDT ?? 0) / store.productCount)
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-100 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Order Rate</p>
              <p className="text-sm font-semibold text-zinc-900">
                {store.productCount && store.productCount > 0
                  ? `${((store.orderCount ?? 0) / store.productCount * 100).toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
