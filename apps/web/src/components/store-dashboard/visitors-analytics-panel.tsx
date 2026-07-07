"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useGetStoreAnalyticsStatsQuery,
  useGetStoreVisitorChartsQuery,
  useGetStoreDevicesQuery,
  useGetStoreTopContentQuery,
  useGetLiveVisitorsQuery,
} from "@/redux/api/analytics-api";
import {
  Users, Eye, Clock, Activity, TrendingUp, Loader2,
  Monitor, Smartphone, Tablet, Search, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function VisitorsAnalyticsPanel({ storeId }: { storeId: string }) {
  const { data: statsData, isLoading: statsLoading } = useGetStoreAnalyticsStatsQuery(storeId, { skip: !storeId });
  const { data: chartsData } = useGetStoreVisitorChartsQuery(storeId, { skip: !storeId });
  const { data: devicesData } = useGetStoreDevicesQuery(storeId, { skip: !storeId });
  const { data: topContentData } = useGetStoreTopContentQuery(storeId, { skip: !storeId });
  const { data: liveData, refetch: refetchLive } = useGetLiveVisitorsQuery(storeId, { skip: !storeId, pollingInterval: 15000 });

  const stats = statsData?.data as Record<string, unknown> | undefined;
  const charts = chartsData?.data as Record<string, unknown> | undefined;
  const devices = devicesData?.data as Record<string, unknown> | undefined;
  const topContent = topContentData?.data as Record<string, unknown> | undefined;

  const [liveCount, setLiveCount] = useState(0);
  useEffect(() => {
    if (liveData?.data) {
      setLiveCount((liveData.data as Record<string, unknown>).count as number);
    }
  }, [liveData]);

  if (statsLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }

  const visitorsByDay = (charts?.visitorsByDay as Array<Record<string, unknown>>) ?? [];
  const visitorsByHour = (charts?.visitorsByHour as Array<Record<string, unknown>>) ?? [];
  const topProducts = (topContent?.topProducts ?? charts?.topProducts ?? []) as Array<Record<string, unknown>>;
  const topCategories = (charts?.topCategories as Array<Record<string, unknown>>) ?? [];
  const topPages = (charts?.topPages as Array<Record<string, unknown>>) ?? [];

  const statCards = [
    { label: "Today", value: String(stats?.today ?? 0), sub: `${String(stats?.todayUnique ?? 0)} unique`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "This Week", value: String(stats?.week ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "This Month", value: String(stats?.month ?? 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Live Now", value: String(liveCount), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Unique Visitors", value: String(stats?.uniqueVisitors ?? 0), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Returning", value: String(stats?.returningVisitors ?? 0), icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Avg Session", value: formatDuration(Number(stats?.avgSessionDuration ?? 0)), icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Bounce Rate", value: `${String(stats?.bounceRate ?? 0)}%`, icon: Activity, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-5 py-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <span className="text-sm font-semibold text-emerald-800">{liveCount} visitor{liveCount !== 1 ? "s" : ""} online now</span>
        <button onClick={() => refetchLive()} className="ml-auto rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-zinc-200 bg-white p-3.5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${card.bg} p-2 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{card.label}</p>
                <p className="text-lg font-bold text-zinc-900">{String(card.value)}</p>
                {card.sub && <p className="text-[10px] text-zinc-400">{card.sub}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-zinc-900">Daily Visitors</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsByDay}>
                <defs>
                  <linearGradient id="dalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => v?.split("-")[2] ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#dalGrad)" name="Visitors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Visitors by Hour */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-zinc-900">Visitors by Hour (Today)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitorsByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => `${v}:00`} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="visitors" fill="#2563eb" radius={[2, 2, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Devices, Browsers, OS, Countries */}
      <div className="grid gap-6 lg:grid-cols-4">
        {[
          { title: "Devices", key: "devices", data: (devices?.devices as Array<Record<string, unknown>>) ?? [] },
          { title: "Browsers", key: "browsers", data: (devices?.browsers as Array<Record<string, unknown>>) ?? [] },
          { title: "OS", key: "operatingSystems", data: (devices?.operatingSystems as Array<Record<string, unknown>>) ?? [] },
          { title: "Countries", key: "countries", data: (devices?.countries as Array<Record<string, unknown>>) ?? [] },
        ].map((section, si) => (
          <motion.div key={section.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + si * 0.05 }}
            className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{section.title}</h3>
            <div className="space-y-2">
              {section.data.slice(0, 5).map((d: Record<string, unknown>) => (
                <div key={String(d.name ?? d.code)}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-700">{String(d.name ?? d.code ?? "—")}</span>
                    <span className="text-zinc-500">{String(d.percentage ?? "0")}%</span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${String(d.percentage ?? 0)}%` }} />
                  </div>
                </div>
              ))}
              {section.data.length === 0 && <p className="text-xs text-zinc-400">No data yet</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">Top Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.slice(0, 8).map((p: Record<string, unknown>, i: number) => (
                <div key={String(p.productId ?? i)} className="flex items-center justify-between text-xs">
                  <span className="truncate text-zinc-700">{String(p.name ?? "Unknown")}</span>
                  <span className="ml-2 shrink-0 font-medium text-zinc-900">{String(p.views ?? 0)} views</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-zinc-400">No product view data yet</p>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">Top Pages</h3>
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.slice(0, 8).map((p: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="truncate text-zinc-700">{String(p.title ?? p.url ?? "Unknown")}</span>
                  <span className="ml-2 shrink-0 font-medium text-zinc-900">{String(p.views ?? 0)} views</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-zinc-400">No page view data yet</p>}
        </motion.div>
      </div>
    </div>
  );
}
