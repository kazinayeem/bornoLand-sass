"use client";

import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import {
  useGetStoreAnalyticsStatsQuery,
  useGetStoreVisitorChartsQuery,
} from "@/redux/api/analytics-api";
import {
  Users, Eye, Clock, Activity, TrendingUp, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  formatDuration, formatNumber, AnalyticsLoading,
  AnalyticsStatCard, AnalyticsChartCard, AnalyticsEmptyState,
} from "@/components/store-dashboard/analytics/analytics-utils";

export default function VisitorsPage() {
  const { storeId, isLoading } = useStorePage();

  const { data: statsData, isLoading: statsLoading } = useGetStoreAnalyticsStatsQuery(storeId!, { skip: !storeId });
  const { data: chartsData, isLoading: chartsLoading } = useGetStoreVisitorChartsQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;
  if (statsLoading || chartsLoading) return <AnalyticsLoading />;

  const stats = statsData?.data as Record<string, unknown> | undefined;
  const charts = chartsData?.data as Record<string, unknown> | undefined;

  const visitorsByDay = (charts?.visitorsByDay as Array<Record<string, unknown>>) ?? [];
  const visitorsByMonth = (charts?.visitorsByMonth as Array<Record<string, unknown>>) ?? [];
  const visitorsByHour = (charts?.visitorsByHour as Array<Record<string, unknown>>) ?? [];

  const statCards = [
    { label: "Today", value: String(stats?.today ?? 0), sub: `${String(stats?.todayUnique ?? 0)} unique`, icon: Activity, color: "text-apple-primary", bg: "bg-blue-50" },
    { label: "Yesterday", value: String(stats?.yesterday ?? 0), sub: `${String(stats?.yesterdayUnique ?? 0)} unique`, icon: Clock, color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
    { label: "This Week", value: String(stats?.week ?? 0), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "This Month", value: String(stats?.month ?? 0), sub: `${String(stats?.monthUnique ?? 0)} unique`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Last Month", value: String(stats?.lastMonth ?? 0), icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "This Year", value: String(stats?.year ?? 0), icon: Eye, color: "text-rose-600", bg: "bg-rose-50" },
    { label: "Unique Visitors", value: String(stats?.uniqueVisitors ?? 0), icon: Users, color: "text-apple-primary", bg: "bg-blue-50" },
    { label: "Returning", value: String(stats?.returningVisitors ?? 0), icon: RefreshCw, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Avg Session", value: formatDuration(Number(stats?.avgSessionDuration ?? 0)), icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Bounce Rate", value: `${String(stats?.bounceRate ?? 0)}%`, icon: Activity, color: "text-red-600", bg: "bg-red-50" },
    { label: "Total Visitors", value: formatNumber(Number(stats?.totalVisitors ?? 0)), icon: Users, color: "text-apple-ink-muted-80", bg: "bg-apple-canvas-parchment" },
    { label: "Live Now", value: String(stats?.liveVisitors ?? 0), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Visitor Analytics</h1>
        <p className="text-sm text-apple-ink-muted-48">Track visitors, sessions, and engagement</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <AnalyticsStatCard key={card.label} {...card} delay={i * 0.02} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Visitors by Day (This Month)" delay={0.1}>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorsByDay}>
                <defs>
                  <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#71717a" }} tickFormatter={(v) => v?.split("-")[2] ?? ""} />
                <YAxis tick={{ fontSize: 10, fill: "#71717a" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2} fill="url(#vGrad)" name="Visitors" />
                <Line type="monotone" dataKey="pageViews" stroke="#10b981" strokeWidth={1.5} dot={false} name="Page Views" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Visitors by Month" delay={0.15}>
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
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard title="Visitors by Hour (Today)" delay={0.2}>
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
      </AnalyticsChartCard>
    </>
  );
}
