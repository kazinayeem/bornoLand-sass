"use client";

import { motion } from "framer-motion";
import {
  useGetPlatformRevenueAnalyticsQuery,
  useGetPlatformOverviewQuery,
} from "@/redux/api/admin-api";
import {
  Activity, TrendingUp, Loader2, DollarSign, CreditCard, ShoppingBag,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { formatBDT } from "@/lib/format-bdt";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const PAYMENT_COLORS: Record<string, string> = {
  sslcommerz: "#e11d48", bkash: "#e2136e", nagad: "#e97306",
  rocket: "#1d4ed8", stripe: "#635bff", manual: "#52525b",
  bank_transfer: "#15803d", cash: "#65a30d", cod: "#65a30d",
};

function getMethodColor(method: string): string {
  return PAYMENT_COLORS[method.toLowerCase().replace(/\s+/g, "_")] ?? "#a1a1aa";
}

export default function AdminAnalyticsPage() {
  const { data: revData, isLoading: revLoading } = useGetPlatformRevenueAnalyticsQuery();
  const { data: platData } = useGetPlatformOverviewQuery();

  const rev = revData?.data as Record<string, unknown> | undefined;
  const ov = platData?.data as Record<string, unknown> | undefined;

  if (revLoading || !rev) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const revenue = ov?.revenue as Record<string, unknown> | undefined;
  const daily = (rev.daily as Array<Record<string, unknown>>) ?? [];
  const monthly = (rev.monthly as Array<Record<string, unknown>>) ?? [];
  const byPlan = (rev.byPlan as Array<Record<string, unknown>>) ?? [];
  const byPayment = (rev.byPayment as Array<Record<string, unknown>>) ?? [];
  const byStore = (rev.byStore as Array<Record<string, unknown>>) ?? [];

  const statCards = [
    { label: "Total Revenue", value: (revenue?.total as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0" },
    { label: "Monthly Revenue", value: (revenue?.monthly as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0" },
    { label: "Today's Revenue", value: (revenue?.today as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0" },
    { label: "MRR", value: (revenue?.mrr as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Revenue Analytics"
        description="All values in BDT (৳) — Bangladeshi Taka."
      />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{card.label}</p>
                <p className="mt-0.5 text-lg font-bold text-zinc-900">{card.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Revenue Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Monthly Revenue (৳)</h3>
          <p className="mb-6 text-sm text-zinc-500">Revenue and order trends over the last 12 months</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly.length > 0 ? monthly : []}>
                <defs>
                  <linearGradient id="mRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={((value: number) => [formatBDT(value), "Revenue"]) as any}
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#mRevGrad)" name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Daily Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Daily Revenue (৳)</h3>
          <p className="mb-6 text-sm text-zinc-500">Last 30 days</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily.length > 0 ? daily : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={((value: number) => [formatBDT(value), "Revenue"]) as any}
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[2, 2, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Revenue by Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h3 className="mb-1 text-lg font-semibold text-zinc-900">Revenue by Plan</h3>
        <p className="mb-4 text-sm text-zinc-500">How much each plan has generated in ৳ BDT</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {byPlan.map((plan) => {
            const rev = plan.formattedRevenue as Record<string, unknown> ?? plan.revenue as Record<string, unknown>;
              const revAmount = typeof rev === "object" ? String((rev as Record<string, unknown>).formattedAmount ?? "৳ 0") : String(rev ?? "৳ 0");
            return (
              <div key={String(plan.planId ?? "")} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-900">{String(plan.planName ?? "")}</p>
                <p className="mt-1 text-lg font-bold text-emerald-600">{revAmount}</p>
                <p className="text-xs text-zinc-400">{String(plan.orders ?? 0)} orders</p>
              </div>
            );
          })}
          {byPlan.length === 0 && (
            <p className="col-span-full text-sm text-zinc-400">No plan data yet</p>
          )}
        </div>
      </motion.div>

      {/* Revenue by Payment Method */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Revenue by Payment Method</h3>
          <p className="mb-4 text-sm text-zinc-500">Payment method performance in ৳</p>
          <div className="space-y-3">
            {byPayment.map((pm) => {
              const method = String(pm.method ?? "Unknown");
              const rev = pm.formattedRevenue as Record<string, unknown> ?? pm.revenue as Record<string, unknown>;
              const revAmount = typeof rev === "object" ? String((rev as Record<string, unknown>).formattedAmount ?? "৳ 0") : String(rev ?? "৳ 0");
              const pct = byPayment.length > 0
                ? Math.round((Number((pm.revenue as Record<string, unknown>)?.amount ?? 0) / Math.max(byPayment.reduce((s, p) => s + Number((p.revenue as Record<string, unknown>)?.amount ?? 0), 0), 1)) * 100)
                : 0;
              return (
                <div key={method} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: getMethodColor(method) }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-700 capitalize">{method}</span>
                      <span className="text-sm font-semibold text-zinc-900">{revAmount}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: getMethodColor(method) }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {byPayment.length === 0 && (
              <p className="text-sm text-zinc-400">No payment data yet</p>
            )}
          </div>
        </motion.div>

        {/* Top Stores by Revenue */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Top Stores by Revenue</h3>
          <p className="mb-4 text-sm text-zinc-500">Highest earning stores in ৳</p>
          <div className="space-y-2">
            {byStore.slice(0, 10).map((store) => {
              const rev = store.formattedRevenue as Record<string, unknown> ?? store.revenue as Record<string, unknown>;
              const revAmount = typeof rev === "object" ? String((rev as Record<string, unknown>).formattedAmount ?? "৳ 0") : String(rev ?? "৳ 0");
              return (
                <div key={String(store.storeId ?? "")} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{String(store.storeName ?? "")}</p>
                    <p className="text-xs text-zinc-400">{String(store.orders ?? 0)} orders</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 shrink-0 ml-2">{revAmount}</span>
                </div>
              );
            })}
            {byStore.length === 0 && (
              <p className="text-sm text-zinc-400">No store data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
