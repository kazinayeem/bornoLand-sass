"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import {
  useGetStoreAnalyticsStatsQuery,
  useGetStoreVisitorChartsQuery,
  useGetStoreTrafficSourcesQuery,
  useGetStoreDevicesQuery,
  useGetLiveVisitorsQuery,
  useGetStoreConversionQuery,
} from "@/redux/api/analytics-api";
import {
  Users, Eye, Clock, Activity, TrendingUp, RefreshCw,
  Monitor, Smartphone, Tablet, Globe, MapPin, ShoppingCart,
  FileDown, FileText, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { formatDuration, formatNumber, COLORS, AnalyticsLoading, AnalyticsStatCard, AnalyticsChartCard, AnalyticsProgressBar, exportCSV } from "@/components/store-dashboard/analytics/analytics-utils";

export default function AnalyticsOverviewPage() {
  const { store, storeId, isLoading } = useStorePage();

  const { data: statsData, isLoading: statsLoading } = useGetStoreAnalyticsStatsQuery(storeId!, { skip: !storeId });
  const { data: chartsData, isLoading: chartsLoading } = useGetStoreVisitorChartsQuery(storeId!, { skip: !storeId });
  const { data: sourcesData } = useGetStoreTrafficSourcesQuery(storeId!, { skip: !storeId });
  const { data: devicesData } = useGetStoreDevicesQuery(storeId!, { skip: !storeId });
  const { data: liveData, refetch: refetchLive } = useGetLiveVisitorsQuery(storeId!, { skip: !storeId, pollingInterval: 15000 });
  const { data: conversionData } = useGetStoreConversionQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;
  if (statsLoading || chartsLoading) return <AnalyticsLoading />;

  const stats = statsData?.data as Record<string, unknown> | undefined;
  const charts = chartsData?.data as Record<string, unknown> | undefined;
  const sources = (sourcesData?.data ?? []) as unknown as Array<Record<string, unknown>>;
  const devices = devicesData?.data as Record<string, unknown> | undefined;
  const liveCount = ((liveData?.data as Record<string, unknown>)?.count as number) ?? 0;
  const conversion = conversionData?.data as Record<string, unknown> | undefined;

  const visitorsByDay = (charts?.visitorsByDay as Array<Record<string, unknown>>) ?? [];
  const visitorsByMonth = (charts?.visitorsByMonth as Array<Record<string, unknown>>) ?? [];
  const visitorsByHour = (charts?.visitorsByHour as Array<Record<string, unknown>>) ?? [];
  const topPagesList = (charts?.topPages as Array<Record<string, unknown>>) ?? [];

  const statCards = [
    { label: "Total Visitors", value: formatNumber(Number(stats?.totalVisitors ?? 0)), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Unique Visitors", value: String(stats?.uniqueVisitors ?? 0), sub: "this month", icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Sessions", value: String(stats?.month ?? 0), sub: "this month", icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Page Views", value: formatNumber(Number((charts?.visitorsByDay as Array<Record<string, unknown>>)?.reduce?.((s: number, d: Record<string, unknown>) => s + Number(d.pageViews ?? 0), 0) ?? 0)), icon: Eye, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Bounce Rate", value: `${String(stats?.bounceRate ?? 0)}%`, icon: TrendingUp, color: stats?.bounceRate && Number(stats.bounceRate) > 50 ? "text-red-600" : "text-emerald-600", bg: "bg-red-50" },
    { label: "Avg Session Duration", value: formatDuration(Number(stats?.avgSessionDuration ?? 0)), icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Conversion Rate", value: `${String(conversion?.conversionRate ?? "0.00")}%`, icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Returning Visitors", value: String(stats?.returningVisitors ?? 0), icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "New Visitors", value: String((Number(stats?.month ?? 0) - Number(stats?.returningVisitors ?? 0))), icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Analytics Overview</h1>
          <p className="text-sm text-zinc-500">{store?.name} — visitor analytics dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportCSV("analytics-overview", ["Metric", "Value"], statCards.map((c) => [c.label, c.value]))}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <FileDown className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <AnalyticsStatCard key={card.label} {...card} delay={i * 0.02} />
        ))}
      </div>

      {/* Live Visitors Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">{liveCount} visitors online now</p>
              <p className="text-xs text-zinc-500">Auto-refreshes every 15 seconds</p>
            </div>
          </div>
          <button onClick={() => refetchLive()} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Visitors Over Time (This Month)" delay={0.1}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsByDay}>
                <defs>
                  <linearGradient id="voGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => v?.split("-")[2] ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#voGrad)" name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Sessions Over Time (This Month)" delay={0.12}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitorsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => v?.split("-")[2] ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="sessions" fill="#10b981" radius={[2, 2, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Revenue vs Visitors" delay={0.14}>
          <div className="flex h-48 items-center justify-center text-sm text-zinc-400">
            Revenue data available in Sales Analytics
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Orders vs Visitors" delay={0.16}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsByDay}>
                <defs>
                  <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => v?.split("-")[2] ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#ovGrad)" name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>
      </div>

      {/* Top Landing Pages */}
      <AnalyticsChartCard title="Top Landing Pages" delay={0.18}>
        {topPagesList.length > 0 ? (
          <div className="space-y-2">
            {topPagesList.slice(0, 8).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="truncate text-zinc-700">{String(p.title ?? p.url ?? "Unknown")}</span>
                <span className="ml-2 shrink-0 font-medium text-zinc-900">{String(p.views ?? 0)} views</span>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-zinc-400 py-4">No page data yet</p>}
      </AnalyticsChartCard>

      {/* Traffic Sources Pie */}
      <AnalyticsChartCard title="Traffic Sources" delay={0.2}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sources.slice(0, 8)} dataKey="visits" nameKey="source"
                cx="50%" cy="50%" outerRadius={80} innerRadius={50}
                label={({ source, percent }: any) => `${String(source ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                {sources.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsChartCard>

      {/* Device, Browser, Country breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AnalyticsChartCard title="Device Breakdown" delay={0.22}>
          <div className="space-y-3">
            {(devices?.devices as Array<Record<string, unknown>>)?.map((d) => (
              <div key={String(d.name)} className="flex items-center gap-3">
                {String(d.name) === "Desktop" && <Monitor className="h-4 w-4 text-zinc-400" />}
                {String(d.name) === "Mobile" && <Smartphone className="h-4 w-4 text-zinc-400" />}
                {String(d.name) === "Tablet" && <Tablet className="h-4 w-4 text-zinc-400" />}
                <div className="flex-1">
                  <AnalyticsProgressBar name={String(d.name)} value={String(d.percentage)} percentage={Number(d.percentage)} />
                </div>
              </div>
            )) ?? <p className="text-xs text-zinc-400">No data yet</p>}
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Browser Breakdown" delay={0.24}>
          <div className="space-y-2">
            {(devices?.browsers as Array<Record<string, unknown>>)?.slice(0, 6).map((b) => (
              <AnalyticsProgressBar key={String(b.name)} name={String(b.name)} value={String(b.percentage)} percentage={Number(b.percentage)} />
            )) ?? <p className="text-xs text-zinc-400">No data yet</p>}
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Top Countries" delay={0.26}>
          <div className="space-y-2">
            {(devices?.countries as Array<Record<string, unknown>>)?.slice(0, 6).map((c) => (
              <div key={String(c.code)} className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                <AnalyticsProgressBar name={String(c.code)} value={String(c.percentage)} percentage={Number(c.percentage)} />
              </div>
            )) ?? <p className="text-xs text-zinc-400">No data yet</p>}
          </div>
        </AnalyticsChartCard>
      </div>
    </>
  );
}
