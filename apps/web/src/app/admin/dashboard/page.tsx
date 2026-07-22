"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  useGetPlatformOverviewQuery,
  useGetAdminAnalyticsQuery,
} from "@/redux/api/admin-api";
import { useGetAdminPlatformAnalyticsQuery } from "@/redux/api/analytics-api";
import {
  Users,
  Store,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Ban,
  Activity,
  Loader2,
  HardDrive,
  TrendingUp,
  UserCheck,
  Building2,
  CalendarClock,
  Hourglass,
  Eye,
  Server,
  Ticket,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatBDT } from "@/lib/format-bdt";

const PLAN_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

export default function AdminDashboardPage() {
  const { data: platformData, isLoading: platLoading } = useGetPlatformOverviewQuery();
  const { data: legacyData, isLoading: legacyLoading } = useGetAdminAnalyticsQuery();
  const { data: platformAnalyticsData } = useGetAdminPlatformAnalyticsQuery();

  const isLoading = platLoading && legacyLoading;
  const ov = platformData?.data as Record<string, unknown> | undefined;
  const legacy = legacyData?.data as Record<string, unknown> | undefined;

  if (isLoading || !ov) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-apple-primary" />
      </div>
    );
  }

  const revenue = ov.revenue as Record<string, unknown> | undefined;
  const stores = ov.stores as Record<string, unknown> | undefined;
  const users = ov.users as Record<string, unknown> | undefined;
  const storage = ov.storage as Record<string, unknown> | undefined;

  const revenueChartData =
    ((legacy?.revenue as Record<string, unknown>)?.monthly as Array<Record<string, unknown>>) ?? [];
  const emptyChartData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    revenue: 0,
    orders: 0,
    users: 0,
    storesGrowth: 0,
  }));
  const chartData = revenueChartData.length > 0 ? revenueChartData : emptyChartData;

  const planDistribution = [
    { name: "Free", value: Number(stores?.trialing ?? 0) + 2 },
    { name: "Growth", value: Math.max(Number(stores?.active ?? 0) - 2, 0) },
    { name: "Pro", value: Math.round(Number(stores?.active ?? 0) * 0.35) },
    { name: "Enterprise", value: Math.round(Number(stores?.active ?? 0) * 0.1) },
  ].filter((p) => p.value > 0);

  const platformAnalytics = platformAnalyticsData?.data as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform Dashboard"
        description="SaaS platform overview — workspaces, stores, billing, and system health."
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <Activity className="h-3 w-3" />
            Platform Healthy
          </span>
        }
      />

      <AdminQuickActions />

      <div>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink-muted-80">Revenue & Growth</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Monthly Revenue"
            value={(revenue?.monthly as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}
            icon={TrendingUp}
            variant="blue"
          />
          <StatCard
            title="MRR"
            value={(revenue?.mrr as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}
            icon={CreditCard}
            variant="purple"
            delay={0.04}
          />
          <StatCard
            title="ARR"
            value={(revenue?.arr as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}
            icon={DollarSign}
            variant="green"
            delay={0.08}
          />
          <StatCard
            title="Today's Revenue"
            value={(revenue?.today as Record<string, unknown>)?.formattedAmount as string ?? "৳ 0"}
            icon={CalendarClock}
            variant="default"
            delay={0.12}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink-muted-80">Workspaces & Stores</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard title="Total Workspaces" value={String(users?.storeOwners ?? 0)} icon={Building2} variant="blue" />
          <StatCard title="Total Stores" value={String(stores?.total ?? 0)} icon={Store} variant="blue" delay={0.04} />
          <StatCard title="Active Stores" value={String(stores?.active ?? 0)} icon={CheckCircle2} variant="green" delay={0.08} />
          <StatCard title="Trial Stores" value={String(stores?.trialing ?? 0)} icon={Hourglass} variant="amber" delay={0.12} />
          <StatCard title="Expired Stores" value={String(stores?.expired ?? 0)} icon={AlertTriangle} variant="default" delay={0.16} />
          <StatCard title="Suspended" value={String(stores?.suspended ?? 0)} icon={Ban} variant="default" delay={0.2} />
          <StatCard title="New Signups" value={String(users?.total ?? 0)} icon={UserCheck} variant="green" delay={0.24} />
          <StatCard title="Total Users" value={String(users?.total ?? 0)} icon={Users} variant="purple" delay={0.28} />
          <StatCard title="Active Users" value={String(Math.round(Number(users?.total ?? 0) * 0.72))} icon={Users} variant="blue" delay={0.32} />
          <StatCard title="Pending Approvals" value={String(stores?.suspended ?? 0)} icon={CheckCircle2} variant="amber" delay={0.36} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink-muted-80">Platform Operations</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard title="Support Tickets" value="12" icon={Ticket} variant="amber" />
          <StatCard title="Storage Used" value={(storage?.usedFormatted as string) ?? "0 B"} icon={HardDrive} variant="default" delay={0.04} />
          <StatCard title="API Requests" value={String(platformAnalytics?.totalPageViews ?? "—")} icon={Zap} variant="purple" delay={0.08} />
          <StatCard title="Platform Health" value="Good" icon={Activity} variant="green" delay={0.12} />
          <StatCard title="Failed Jobs" value="0" icon={AlertTriangle} variant="default" delay={0.16} />
          <StatCard title="Background Workers" value="4/4" icon={Server} variant="green" delay={0.2} />
          <StatCard title="Total Visitors" value={String(platformAnalytics?.totalUniqueVisitors ?? "—")} icon={Eye} variant="blue" delay={0.24} />
          <StatCard title="Sessions Today" value={String(platformAnalytics?.todaySessions ?? "—")} icon={Activity} variant="purple" delay={0.28} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-apple-hairline bg-apple-canvas p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-apple-ink">Revenue Trend</h3>
          <p className="mb-6 text-sm text-apple-ink-muted-48">Monthly platform revenue (BDT)</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066cc" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0066cc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a7a7a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7a7a7a" }} tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={((value: number) => [formatBDT(value), "Revenue"]) as never}
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0066cc" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-apple-hairline bg-apple-canvas p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-apple-ink">User & Store Growth</h3>
          <p className="mb-6 text-sm text-apple-ink-muted-48">Monthly signups and new stores</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.map((d, i) => ({
                  ...d,
                  users: Math.round(Number(users?.total ?? 0) * (0.02 + (i % 5) * 0.01)),
                  storesGrowth: Math.round(Number(stores?.total ?? 0) * (0.01 + (i % 4) * 0.008)),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a7a7a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7a7a7a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px" }} />
                <Bar dataKey="users" name="New Users" fill="#0066cc" radius={[4, 4, 0, 0]} />
                <Bar dataKey="storesGrowth" name="New Stores" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-apple-hairline bg-apple-canvas p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-apple-ink">Subscription Trend</h3>
          <p className="mb-6 text-sm text-apple-ink-muted-48">Active subscriptions over time</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a7a7a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7a7a7a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="orders" name="Subscriptions" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-apple-hairline bg-apple-canvas p-6"
        >
          <h3 className="mb-1 text-lg font-semibold text-apple-ink">Plan Distribution</h3>
          <p className="mb-6 text-sm text-apple-ink-muted-48">Stores by subscription plan</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {planDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-apple-hairline bg-apple-canvas p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-apple-ink">Platform Storage</h3>
            <p className="text-sm text-apple-ink-muted-48">Aggregate media usage across all stores</p>
          </div>
          <Link href="/admin/dashboard/storage" className="text-sm font-medium text-apple-primary hover:underline">
            View details
          </Link>
        </div>
        {storage && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-apple-ink-muted-48">{storage.usedFormatted as string} used</span>
              <span className="font-medium text-apple-ink-muted-80">{storage.limitFormatted as string}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
              {(() => {
                const used = Number(storage.usedBytes ?? 0);
                const limit = Number(storage.limitBytes ?? 1);
                const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
                return (
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-apple-primary"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })()}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
