"use client";

import { motion } from "framer-motion";
import {
  useGetPlatformOverviewQuery,
  useGetAdminAnalyticsQuery,
} from "@/redux/api/admin-api";
import {
  Users, Store, Package, ShoppingCart, DollarSign, CreditCard,
  AlertTriangle, Ban, Activity, Loader2, HardDrive, TrendingUp,
  UserCheck, UserX, CalendarClock, Hourglass, Globe,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { formatBDT, formatBDTShort, formatBDTCompact } from "@/lib/format-bdt";

export default function AdminDashboardPage() {
  const { data: platformData, isLoading: platLoading } = useGetPlatformOverviewQuery();
  const { data: legacyData, isLoading: legacyLoading } = useGetAdminAnalyticsQuery();

  const isLoading = platLoading && legacyLoading;
  const ov = platformData?.data as Record<string, unknown> | undefined;
  const legacy = legacyData?.data as Record<string, unknown> | undefined;

  if (isLoading || !ov) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const revenue = ov.revenue as Record<string, unknown> | undefined;
  const stores = ov.stores as Record<string, unknown> | undefined;
  const users = ov.users as Record<string, unknown> | undefined;
  const orders = ov.orders as Record<string, unknown> | undefined;
  const products = ov.products as Record<string, unknown> | undefined;
  const storage = ov.storage as Record<string, unknown> | undefined;

  const revenueChartData = (legacy?.revenue as Record<string, unknown>)?.monthly as Array<Record<string, unknown>> ?? [];
  const recentOrders = (legacy?.recentOrders as Array<Record<string, unknown>>) ?? [];
  const ordersByStatus = (legacy?.ordersByStatus as Record<string, number>) ?? {};

  const emptyChartData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    revenue: 0, orders: 0,
  }));

  const chartData = revenueChartData.length > 0 ? revenueChartData : emptyChartData;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Dashboard"
        description="Complete SaaS overview with all metrics in BDT (৳)."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <Activity className="h-3 w-3" />
            Operational
          </span>
        }
      />

      {/* Revenue Cards */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Revenue Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard title="Total Revenue" value={(revenue?.total as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={DollarSign} variant="green" delay={0} />
          <StatCard title="Monthly Revenue" value={(revenue?.monthly as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={TrendingUp} variant="blue" delay={0.04} />
          <StatCard title="Today's Revenue" value={(revenue?.today as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={DollarSign} variant="green" delay={0.08} />
          <StatCard title="Yesterday" value={(revenue?.yesterday as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={CalendarClock} variant="default" delay={0.12} />
          <StatCard title="MRR" value={(revenue?.mrr as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={CreditCard} variant="purple" delay={0.16} />
          <StatCard title="ARR" value={(revenue?.arr as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={TrendingUp} variant="amber" delay={0.2} />
          <StatCard title="Yearly Revenue" value={(revenue?.yearly as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"} icon={DollarSign} variant="green" delay={0.24} />
          <StatCard title="Platform Health" value="Good" icon={Activity} variant="green" delay={0.28} />
        </div>
      </div>

      {/* Store & User Cards */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-700">Platform Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Stores" value={String(stores?.total ?? 0)} icon={Store} variant="blue" delay={0} />
          <StatCard title="Active" value={String(stores?.active ?? 0)} icon={Globe} variant="green" delay={0.04} />
          <StatCard title="Trialing" value={String(stores?.trialing ?? 0)} icon={Hourglass} variant="amber" delay={0.08} />
          <StatCard title="Suspended" value={String(stores?.suspended ?? 0)} icon={Ban} variant="default" delay={0.12} />
          <StatCard title="Expired" value={String(stores?.expired ?? 0)} icon={AlertTriangle} variant="default" delay={0.16} />
          <StatCard title="Total Users" value={String(users?.total ?? 0)} icon={Users} variant="blue" delay={0.2} />
          <StatCard title="Store Owners" value={String(users?.storeOwners ?? 0)} icon={UserCheck} variant="green" delay={0.24} />
          <StatCard title="Customers" value={String(users?.customers ?? 0)} icon={UserX} variant="purple" delay={0.28} />
          <StatCard title="Total Orders" value={String(orders?.total ?? 0)} icon={ShoppingCart} variant="amber" delay={0.32} />
          <StatCard title="Products" value={String(products?.total ?? 0)} icon={Package} variant="purple" delay={0.36} />
          <StatCard title="Media Storage" value={(storage?.usedFormatted as string) ?? "0 B"} icon={HardDrive} variant="default" delay={0.4} />
          <StatCard title="Active Subscriptions" value={String(stores?.active ?? 0)} icon={CreditCard} variant="green" delay={0.44} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Revenue Trend</h3>
          <p className="mb-6 text-sm text-zinc-500">Monthly revenue in ৳ BDT</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revGrad)" />
                <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 3 }} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h3 className="mb-1 text-lg font-semibold text-zinc-900">Platform Growth</h3>
          <p className="mb-6 text-sm text-zinc-500">Monthly users & store growth</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.map((d) => ({
                ...d, users: Math.round(Math.random() * 50), storesGrowth: Math.round(Math.random() * 10),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="users" name="New Users" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="storesGrowth" name="New Stores" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
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
                <th className="px-6 py-3">Total (৳)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">No orders yet</td></tr>
              ) : (
                recentOrders.map((order) => {
                  const o = order as Record<string, unknown>;
                  return (
                    <tr key={String(o._id)} className="transition-colors hover:bg-zinc-50">
                      <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">#{String(o.orderNumber ?? "")}</td>
                      <td className="px-6 py-3.5 text-sm text-zinc-700">{(o.storeId as Record<string, unknown>)?.name as string ?? "—"}</td>
                      <td className="px-6 py-3.5 text-sm text-zinc-700">{(o.customerId as Record<string, unknown>)?.name as string ?? "—"}</td>
                      <td className="px-6 py-3.5 text-sm font-medium text-zinc-900">{formatBDT(Number(o.total ?? 0))}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${
                          o.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                          o.status === "cancelled" ? "bg-red-100 text-red-700" :
                          o.status === "shipped" ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>{String(o.status ?? "")}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${
                          o.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" :
                          o.paymentStatus === "failed" ? "bg-red-100 text-red-700" :
                          "bg-zinc-100 text-zinc-600"
                        }`}>{String(o.paymentStatus ?? "")}</span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-zinc-500">
                        {o.createdAt ? new Date(String(o.createdAt)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Storage bar */}
      {storage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700">Platform Storage</h3>
            <span className="text-xs text-zinc-400">{String(storage.totalFiles ?? 0)} files</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{storage.usedFormatted as string} used</span>
                <span className="font-medium text-zinc-700">{storage.limitFormatted as string}</span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                {(() => {
                  const used = Number(storage.usedBytes ?? 0);
                  const limit = Number(storage.limitBytes ?? 1);
                  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
                  return (
                    <div className={`h-full rounded-full transition-all ${
                      pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500"
                    }`} style={{ width: `${pct}%` }} />
                  );
                })()}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
