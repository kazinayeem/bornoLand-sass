"use client";

import { motion } from "framer-motion";
import { useGetAdminAnalyticsQuery } from "@/redux/api/admin-api";
import {
  Users, Store, Package, ShoppingCart, DollarSign, CreditCard,
  AlertTriangle, Ban, Activity, Loader2
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { formatCurrency } from "@/lib/format-currency";

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetAdminAnalyticsQuery();
  const analytics = data?.data;

  if (isLoading || !analytics) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const { counts, revenue, growth, ordersByStatus, recentOrders } = analytics;

  const totalRevenue = counts.orders > 0 ? revenue.total : 0;

  const revenueChartData = revenue.monthly.length > 0 ? revenue.monthly :
    Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      revenue: 0, orders: 0
    }));

  const userGrowthData = growth.users.length > 0 ? growth.users :
    revenueChartData.map((d) => ({ month: d.month, count: 0 }));

  const storeGrowthData = growth.stores.length > 0 ? growth.stores :
    revenueChartData.map((d) => ({ month: d.month, count: 0 }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h2>
          <p className="mt-1 text-sm text-zinc-500">Platform overview at a glance.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 sm:flex">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-zinc-700">All systems operational</span>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Users" value={counts.users} icon={Users} variant="blue" delay={0} />
        <StatCard title="Total Stores" value={counts.stores} icon={Store} variant="green" delay={0.04} />
        <StatCard title="Total Products" value={counts.products} icon={Package} variant="purple" delay={0.08} />
        <StatCard title="Total Orders" value={counts.orders} icon={ShoppingCart} variant="amber" delay={0.12} />
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} variant="green" delay={0.16} prefix="" />
        <StatCard title="Active Subscriptions" value={counts.activeSubscriptions} icon={CreditCard} variant="blue" delay={0.2} />
        <StatCard title="Pending Payments" value={counts.pendingPayments} icon={AlertTriangle} variant="amber" delay={0.24} />
        <StatCard title="Suspended Stores" value={counts.suspendedStores} icon={Ban} variant="default" delay={0.28} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Revenue Overview</h3>
          <p className="mb-6 text-sm text-zinc-500">Monthly revenue and order trends</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueGradient)" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Growth Metrics</h3>
          <p className="mb-6 text-sm text-zinc-500">Monthly user and store growth</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowthData.map((u, i) => ({ ...u, stores: storeGrowthData[i]?.count ?? 0 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="count" name="New Users" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="stores" name="New Stores" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-zinc-900">Recent Orders</h3>
          <span className="text-xs text-zinc-400">{ordersByStatus.pending ?? 0} pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Store</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(recentOrders as Array<Record<string, unknown>>).length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">No orders yet</td></tr>
              ) : (
                (recentOrders as Array<any>).map((order: any) => (
                  <tr key={order._id} className="transition-colors hover:bg-zinc-50">
                    <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">#{order.orderNumber}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-700">{(order.storeId as any)?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-700">{(order.customerId as any)?.name ?? "—"}</td>
                    <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">{formatCurrency(order.total ?? 0)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${
                        order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${
                        order.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                        order.paymentStatus === "failed" ? "bg-red-100 text-red-700" :
                        "bg-zinc-100 text-zinc-600"
                      }`}>{order.paymentStatus}</span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
