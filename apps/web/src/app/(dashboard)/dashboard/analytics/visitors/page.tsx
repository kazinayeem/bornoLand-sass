"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  useGetMyStoresQuery,
} from "@/redux/api/store-api";
import {
  useGetStoreAnalyticsStatsQuery,
  useGetStoreVisitorChartsQuery,
  useGetStoreTrafficSourcesQuery,
  useGetStoreDevicesQuery,
  useGetStoreTopContentQuery,
  useGetLiveVisitorsQuery,
} from "@/redux/api/analytics-api";
import {
  Users, Eye, Clock, Activity, TrendingUp, AlertTriangle,
  Loader2, Search, MousePointerClick, ArrowUpRight, Globe,
  Monitor, Smartphone, Tablet, ExternalLink, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function VisitorsAnalyticsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const storeId = stores[0]?._id ?? "";

  const { data: statsData, isLoading: statsLoading } = useGetStoreAnalyticsStatsQuery(storeId, { skip: !storeId });
  const { data: chartsData, isLoading: chartsLoading } = useGetStoreVisitorChartsQuery(storeId, { skip: !storeId });
  const { data: sourcesData } = useGetStoreTrafficSourcesQuery(storeId, { skip: !storeId });
  const { data: devicesData } = useGetStoreDevicesQuery(storeId, { skip: !storeId });
  const { data: topContentData } = useGetStoreTopContentQuery(storeId, { skip: !storeId });
  const { data: liveData, refetch: refetchLive } = useGetLiveVisitorsQuery(storeId, { skip: !storeId, pollingInterval: 10000 });

  const stats = statsData?.data as Record<string, unknown> | undefined;
  const charts = chartsData?.data as Record<string, unknown> | undefined;
  const sources = sourcesData?.data as Array<Record<string, unknown>> | undefined;
  const devices = devicesData?.data as Record<string, unknown> | undefined;
  const topContent = topContentData?.data as Record<string, unknown> | undefined;

  const [selectedStoreId, setSelectedStoreId] = useState(storeId);
  useEffect(() => { if (storeId && !selectedStoreId) setSelectedStoreId(storeId); }, [storeId, selectedStoreId]);

  const [liveCount, setLiveCount] = useState(0);
  useEffect(() => {
    if (liveData?.data) {
      setLiveCount((liveData.data as Record<string, unknown>).count as number);
    }
  }, [liveData]);

  if (!storeId) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-apple-ink-muted-48">Create a store to view analytics.</p>
      </div>
    );
  }

  if (statsLoading || chartsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const visitorsByDay = (charts?.visitorsByDay as Array<Record<string, unknown>>) ?? [];
  const visitorsByMonth = (charts?.visitorsByMonth as Array<Record<string, unknown>>) ?? [];
  const visitorsByHour = (charts?.visitorsByHour as Array<Record<string, unknown>>) ?? [];

  const statCards = [
    { label: "Today", value: String(stats?.today ?? 0), sub: `${String(stats?.todayUnique ?? 0)}জন অনন্য`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Yesterday", value: String(stats?.yesterday ?? 0), sub: `${String(stats?.yesterdayUnique ?? 0)}জন অনন্য`, icon: Clock, color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
    { label: "This Week", value: String(stats?.week ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "This Month", value: String(stats?.month ?? 0), sub: `${String(stats?.monthUnique ?? 0)}জন অনন্য`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Last Month", value: String(stats?.lastMonth ?? 0), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "This Year", value: String(stats?.year ?? 0), icon: Eye, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Unique Visitors", value: String(stats?.uniqueVisitors ?? 0), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Returning Visitors", value: String(stats?.returningVisitors ?? 0), icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Avg Session Duration", value: formatDuration(Number(stats?.avgSessionDuration ?? 0)), icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Bounce Rate", value: `${String(stats?.bounceRate ?? 0)}%`, icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    { label: "Total Visitors", value: formatNumber(Number(stats?.totalVisitors ?? 0)), icon: Users, color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
    { label: "Live Online", value: String(liveCount), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  const topProducts = (topContent?.topProducts as Array<Record<string, unknown>>) ?? (charts?.topProducts as Array<Record<string, unknown>>) ?? [];
  const topCategoriesList = (charts?.topCategories as Array<Record<string, unknown>>) ?? [];
  const topPagesList = (charts?.topPages as Array<Record<string, unknown>>) ?? [];
  const topSearchesList = (charts?.topSearchQueries as Array<Record<string, unknown>>) ?? [];
  const sourcesList = (sources ?? []).slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-apple-ink">ভিজিটর অ্যানালিটিক্স</h1>
        <p className="text-sm text-apple-ink-muted-48">দোকানের ট্রাফিক, পেজ ভিউ এবং কাস্টমার ইনসাইট ট্র্যাক করুন</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="rounded-xl border border-zinc-200 bg-white p-3.5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg ${card.bg} p-2 ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-apple-ink-muted-48">{card.label}</p>
                <p className="text-lg font-bold text-apple-ink">{String(card.value)}</p>
                {card.sub && <p className="text-[10px] text-apple-ink-muted-48">{card.sub}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visitors by Day */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-apple-ink">দৈনিক ভিজিটর (এই মাস)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsByDay}>
                <defs>
                  <linearGradient id="vdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => v?.split("-")[2] ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#vdGrad)" name="Visitors" />
                <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={1.5} dot={false} name="Page Views" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Visitors by Month */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-semibold text-apple-ink">মাসিক ভিজিটর হিস্ট্রি</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitorsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#71717a" }} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="visitors" fill="#2563eb" radius={[2, 2, 0, 0]} name="Visitors" />
                <Bar dataKey="sessions" fill="#10b981" radius={[2, 2, 0, 0]} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Hourly chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-1 text-sm font-semibold text-apple-ink">আজকের ঘণ্টাওয়াড়ি ভিজিটর</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitorsByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => `${v}:00`} />
              <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }}
                formatter={((value: number) => [value, "Visitors"]) as any} />
              <Bar dataKey="visitors" fill="#2563eb" radius={[2, 2, 0, 0]} name="Visitors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Devices, Browsers, OS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Devices */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">ডিভাইস ব্যবহার</h3>
          <div className="space-y-3">
            {(devices?.devices as Array<Record<string, unknown>>)?.map((d: Record<string, unknown>) => (
              <div key={String(d.name)} className="flex items-center gap-3">
                {String(d.name) === "Desktop" && <Monitor className="h-4 w-4 text-apple-ink-muted-48" />}
                {String(d.name) === "Mobile" && <Smartphone className="h-4 w-4 text-apple-ink-muted-48" />}
                {String(d.name) === "Tablet" && <Tablet className="h-4 w-4 text-apple-ink-muted-48" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-apple-ink-muted-80">{String(d.name)}</span>
                    <span className="text-apple-ink-muted-48">{String(d.percentage)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${String(d.percentage)}%` }} />
                  </div>
                </div>
              </div>
            )) ?? <p className="text-xs text-apple-ink-muted-48">কোনো ডাটা পাওয়া যায়নি</p>}
          </div>
        </motion.div>

        {/* Browsers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">ব্রাউজারসমূহ</h3>
          <div className="space-y-2">
            {(devices?.browsers as Array<Record<string, unknown>>)?.slice(0, 6).map((b: Record<string, unknown>) => (
              <div key={String(b.name)} className="flex items-center justify-between text-xs">
                <span className="text-apple-ink-muted-80">{String(b.name)}</span>
                <span className="text-apple-ink-muted-48">{String(b.percentage)}%</span>
              </div>
            )) ?? <p className="text-xs text-apple-ink-muted-48">কোনো ডাটা পাওয়া যায়নি</p>}
          </div>
        </motion.div>

        {/* OS */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">অপারেটিং সিস্টেম</h3>
          <div className="space-y-2">
            {(devices?.operatingSystems as Array<Record<string, unknown>>)?.slice(0, 6).map((o: Record<string, unknown>) => (
              <div key={String(o.name)} className="flex items-center justify-between text-xs">
                <span className="text-apple-ink-muted-80">{String(o.name)}</span>
                <span className="text-apple-ink-muted-48">{String(o.percentage)}%</span>
              </div>
            )) ?? <p className="text-xs text-apple-ink-muted-48">কোনো ডাটা পাওয়া যায়নি</p>}
          </div>
        </motion.div>
      </div>

      {/* Traffic Sources */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-apple-ink">ট্রাফিক সোর্স (কোথা থেকে ভিজিটর এসেছে)</h3>
        {sourcesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-apple-ink-muted-48">
                  <th className="px-3 py-2 font-medium">সোর্স</th>
                  <th className="px-3 py-2 font-medium">টাইপ</th>
                  <th className="px-3 py-2 font-medium">ভিজিট সংখ্যা</th>
                  <th className="px-3 py-2 font-medium">পেজ ভিউ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {sourcesList.map((s) => (
                  <tr key={String(s._id)} className="hover:bg-apple-canvas-parchment">
                    <td className="px-3 py-2 font-medium text-apple-ink">{String(s.source)}</td>
                    <td className="px-3 py-2 capitalize text-apple-ink-muted-48">{String(s.type)}</td>
                    <td className="px-3 py-2 text-apple-ink-muted-80">{String(s.visits ?? 0)}</td>
                    <td className="px-3 py-2 text-apple-ink-muted-80">{String(s.pageViews ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-apple-ink-muted-48">কোনো ট্রাফিক ডাটা পাওয়া যায়নি</p>
        )}
      </motion.div>

      {/* Top Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">সবচেয়ে বেশি দেখা পণ্যসমূহ</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.slice(0, 8).map((p: Record<string, unknown>, i: number) => (
                <div key={String(p.productId ?? i)} className="flex items-center justify-between text-xs">
                  <span className="truncate text-apple-ink-muted-80">{String(p.name ?? "Unknown Product")}</span>
                  <span className="ml-2 shrink-0 font-medium text-apple-ink">{String(p.views ?? 0)} বার দেখা হয়েছে</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-apple-ink-muted-48">কোনো প্রোডাক্ট ভিউ ডাটা পাওয়া যায়নি</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">জনপ্রিয় সার্চ কোয়েরি</h3>
          {topSearchesList.length > 0 ? (
            <div className="space-y-2">
              {topSearchesList.slice(0, 8).map((q: Record<string, unknown>, i: number) => (
                <div key={String(q.query ?? i)} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-apple-ink-muted-80">
                    <Search className="h-3 w-3 text-apple-ink-muted-48" />
                    {String(q.query ?? "")}
                  </span>
                  <span className="shrink-0 font-medium text-apple-ink">{String(q.count ?? 0)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-apple-ink-muted-48">কোনো সার্চ ডাটা পাওয়া যায়নি</p>}
        </motion.div>
      </div>

      {/* Live Visitors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-apple-ink">লাইভ অনলাইন ভিজিটর</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              {String(liveCount)}জন অনলাইনে আছেন
            </span>
          </div>
          <button onClick={() => refetchLive()} className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs text-apple-ink-muted-48">প্রতি ১০ সেকেন্ড পর পর স্বয়ংক্রিয় রিফ্রেশ হয়</p>
      </motion.div>
    </div>
  );
}
