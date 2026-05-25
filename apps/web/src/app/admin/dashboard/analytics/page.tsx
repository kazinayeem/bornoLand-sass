"use client";

import { motion } from "framer-motion";
import { useGetAdminAnalyticsQuery } from "@/redux/api/admin-api";
import {
  Activity, TrendingUp, Users, Store, ShoppingCart, Package, Loader2
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from "recharts";
import { formatCurrency } from "@/lib/format-currency";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useGetAdminAnalyticsQuery();
  const analytics = data?.data;

  if (isLoading || !analytics) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { counts, revenue, growth, storesByStatus, ordersByStatus } = analytics;

  const totalRevenue = counts.orders > 0 ? revenue.total : 0;

  const revenueChartData = revenue.monthly.length > 0
    ? revenue.monthly
    : Array.from({ length: 12 }, (_, i) => ({
        month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
        revenue: 0, orders: 0,
      }));

  const userGrowthData = growth.users.length > 0
    ? growth.users
    : revenueChartData.map((d) => ({ month: d.month, count: 0 }));

  const storeGrowthData = growth.stores.length > 0
    ? growth.stores
    : revenueChartData.map((d) => ({ month: d.month, count: 0 }));

  const ordersPieData = Object.entries(ordersByStatus).map(([name, value]) => ({
    name: ORDER_STATUS_LABELS[name] ?? name,
    value,
  }));

  const storeStatusData = Object.entries(storesByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const statItems = [
    { label: "Total Users", value: counts.users, icon: Users, color: "text-blue-600" },
    { label: "Total Stores", value: counts.stores, icon: Store, color: "text-emerald-600" },
    { label: "Total Products", value: counts.products, icon: Package, color: "text-purple-600" },
    { label: "Total Orders", value: counts.orders, icon: ShoppingCart, color: "text-amber-600" },
    { label: "Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-600" },
    { label: "Active Subs", value: counts.activeSubscriptions, icon: Activity, color: "text-blue-600" },
    { label: "Pending Payments", value: counts.pendingPayments, icon: Activity, color: "text-amber-600" },
    { label: "Suspended Stores", value: counts.suspendedStores, icon: Activity, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Analytics</h2>
          <p className="mt-1 text-sm text-zinc-500">Detailed platform analytics and metrics.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 sm:flex">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-zinc-700">Live data</span>
        </div>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-xl bg-zinc-50 p-2.5 ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{item.label}</p>
                <p className="mt-0.5 text-xl font-bold text-zinc-900">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Revenue Overview</h3>
          <p className="mb-6 text-sm text-zinc-500">Monthly revenue with gradient area fill</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueGradient2)" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Orders by Status</h3>
          <p className="mb-6 text-sm text-zinc-500">Distribution of order statuses</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ordersPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] ?? "#a1a1aa"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-zinc-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Growth Metrics</h3>
          <p className="mb-6 text-sm text-zinc-500">Monthly user and store growth comparison</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userGrowthData.map((u, i) => ({
                  ...u,
                  stores: storeGrowthData[i]?.count ?? 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="count" name="New Users" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stores" name="New Stores" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Store Status</h3>
          <p className="mb-6 text-sm text-zinc-500">Breakdown of stores by status</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e4e4e7",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="value" name="Stores" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
