"use client";

import { DollarSign, ShoppingBag, Package, Users, HardDrive, TrendingUp, Eye, Clock, Activity, Monitor, Smartphone, Tablet, Globe, Search } from "lucide-react";
import type { TabHelpers } from "./types";
import { useGetAdminStoreAnalyticsQuery, useGetAdminStoreVisitorStatsQuery } from "@/redux/api/analytics-api";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function AnalyticsTab({ helpers }: { helpers: TabHelpers }) {
  const { statsData, isLoading, storeId } = helpers;
  const stats = statsData as Record<string, unknown> | undefined;

  const { data: visitorData, isLoading: visitorLoading } = useGetAdminStoreVisitorStatsQuery(storeId, { skip: !storeId });
  const visitorStats = visitorData?.data as Record<string, unknown> | undefined;

  if (isLoading || visitorLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
      </div>
    );
  }

  const revenue = Number(stats?.revenue ?? 0);
  const orders = Number(stats?.orders ?? 0);
  const products = Number(stats?.products ?? 0);
  const customers = Number(stats?.customers ?? 0);
  const media = Number(stats?.media ?? 0);
  const bestSelling = (stats?.bestSelling as Array<{ name: string; totalSold: number; revenue: number }>) ?? [];
  const monthlySales = (stats?.monthlySales as Array<{ _id: { year: number; month: number }; revenue: number; orders: number }>) ?? [];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const statCards = [
    { label: "Revenue", value: `৳${revenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600" },
    { label: "Orders", value: orders.toLocaleString(), icon: ShoppingBag, color: "text-blue-600" },
    { label: "Products", value: products.toLocaleString(), icon: Package, color: "text-purple-600" },
    { label: "Customers", value: customers.toLocaleString(), icon: Users, color: "text-amber-600" },
    { label: "Media Files", value: media.toLocaleString(), icon: HardDrive, color: "text-cyan-600" },
  ];

  const visitorCards = [
    { label: "Today", value: String(visitorStats?.today ?? 0), icon: Clock, color: "text-blue-600" },
    { label: "This Month", value: String(visitorStats?.month ?? 0), icon: Eye, color: "text-purple-600" },
    { label: "Unique Visitors", value: String(visitorStats?.uniqueVisitors ?? 0), icon: Users, color: "text-emerald-600" },
    { label: "Returning", value: String(visitorStats?.returningVisitors ?? 0), icon: Activity, color: "text-indigo-600" },
    { label: "Avg Session", value: formatDuration(Number(visitorStats?.avgSessionDuration ?? 0)), icon: Clock, color: "text-teal-600" },
    { label: "Bounce Rate", value: `${String(visitorStats?.bounceRate ?? 0)}%`, icon: TrendingUp, color: "text-red-600" },
    { label: "Live Now", value: String(visitorStats?.liveVisitors ?? 0), icon: Activity, color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Store Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-4">
            <card.icon className={`h-5 w-5 ${card.color}`} />
            <p className="mt-3 text-2xl font-bold text-zinc-900">{card.value}</p>
            <p className="text-xs text-zinc-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Visitor Stats */}
      <div>
        <h4 className="mb-3 text-sm font-semibold text-zinc-700">Visitor Analytics</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visitorCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <p className="text-xs text-zinc-500">{card.label}</p>
              </div>
              <p className="mt-1 text-lg font-bold text-zinc-900">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Sales Chart */}
      {monthlySales.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-zinc-700">Monthly Sales</h4>
          <div className="mt-4 flex items-end gap-2" style={{ height: 160 }}>
            {[...monthlySales].reverse().map((m, i) => {
              const maxRevenue = Math.max(...monthlySales.map((s) => s.revenue), 1);
              const height = (m.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-400">৳{(m.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full rounded-t bg-blue-500 transition-all" style={{ height: `${Math.max(height, 4)}%` }} />
                  <span className="text-[10px] text-zinc-400">{monthNames[m._id.month - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversion Rate */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-zinc-700">Conversion</h4>
        <p className="mt-2 text-2xl font-bold text-zinc-900">
          {customers > 0 ? ((orders / customers) * 100).toFixed(1) : "0"}%
        </p>
        <p className="text-xs text-zinc-500">Order-to-customer conversion rate</p>
      </div>

      {/* Best Selling Products */}
      {bestSelling.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-zinc-700">Best Selling Products</h4>
          <div className="mt-3 divide-y divide-zinc-100">
            {bestSelling.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-400">#{i + 1}</span>
                  <p className="text-sm text-zinc-700">{item.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-900">{item.totalSold} sold</p>
                  <p className="text-xs text-zinc-400">৳{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!stats && !visitorStats && (
        <div className="flex h-40 items-center justify-center text-sm text-zinc-400">
          <TrendingUp className="mr-2 h-5 w-5" />
          No analytics data available yet
        </div>
      )}
    </div>
  );
}
