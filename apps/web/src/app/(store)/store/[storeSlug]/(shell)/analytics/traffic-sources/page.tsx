"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreTrafficSourcesQuery, useGetStoreDevicesQuery, useGetStoreTopContentQuery } from "@/redux/api/analytics-api";
import { Globe, Search, ExternalLink, Monitor, Smartphone, Tablet, MapPin, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS, AnalyticsLoading, AnalyticsStatCard, AnalyticsChartCard, AnalyticsProgressBar } from "@/components/store-dashboard/analytics/analytics-utils";

export default function TrafficSourcesPage() {
  const { storeId, isLoading } = useStorePage();

  const { data: sourcesData, isLoading: sourcesLoading } = useGetStoreTrafficSourcesQuery(storeId!, { skip: !storeId });
  const { data: devicesData } = useGetStoreDevicesQuery(storeId!, { skip: !storeId });
  const { data: topContentData } = useGetStoreTopContentQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const sources = (sourcesData?.data ?? []) as unknown as Array<Record<string, unknown>>;
  const devices = devicesData?.data as Record<string, unknown> | undefined;
  const topContent = topContentData?.data as Record<string, unknown> | undefined;

  const [filter, setFilter] = useState("all");
  const filteredSources = filter === "all" ? sources : sources.filter((s) => String(s.type) === filter);
  const sourceTypes = useMemo(() => [...new Set(sources.map((s) => String(s.type)))], [sources]);
  const totalVisits = sources.reduce((sum, s) => sum + Number(s.visits ?? 0), 0);

  if (sourcesLoading) return <AnalyticsLoading />;

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Traffic Sources</h1>
        <p className="text-sm text-zinc-500">Where your visitors come from</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsStatCard label="Total Visits" value={String(totalVisits)} icon={Globe} color="text-blue-600" bg="bg-blue-50" delay={0} />
        <AnalyticsStatCard label="Traffic Sources" value={String(sources.length)} icon={Globe} color="text-emerald-600" bg="bg-emerald-50" delay={0.05} />
        <AnalyticsStatCard label="Unique Visitors" value={String(sources.reduce((sum, s) => sum + Number(s.uniqueVisitors ?? 0), 0))} icon={Globe} color="text-purple-600" bg="bg-purple-50" delay={0.1} />
        <AnalyticsStatCard label="Page Views" value={String(sources.reduce((sum, s) => sum + Number(s.pageViews ?? 0), 0))} icon={Globe} color="text-amber-600" bg="bg-amber-50" delay={0.15} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        <AnalyticsChartCard title="Distribution" delay={0.1}>
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-zinc-900">All Sources</h3>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-600 outline-none focus:border-blue-400">
              <option value="all">All Types</option>
              {sourceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Visits</th>
                  <th className="px-5 py-3">Unique</th>
                  <th className="px-5 py-3">Page Views</th>
                  <th className="px-5 py-3">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredSources.map((s) => (
                  <tr key={String(s._id)} className="hover:bg-zinc-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-xs font-medium text-zinc-800">{String(s.source)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 capitalize">
                        {String(s.type)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-zinc-900">{String(s.visits ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-zinc-600">{String(s.uniqueVisitors ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-zinc-600">{String(s.pageViews ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {totalVisits > 0 ? `${((Number(s.visits ?? 0) / totalVisits) * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {[
          { title: "Devices", data: (devices?.devices as Array<Record<string, unknown>>) ?? [] },
          { title: "Browsers", data: (devices?.browsers as Array<Record<string, unknown>>) ?? [] },
          { title: "OS", data: (devices?.operatingSystems as Array<Record<string, unknown>>) ?? [] },
          { title: "Countries", data: (devices?.countries as Array<Record<string, unknown>>) ?? [] },
        ].map((section, si) => (
          <AnalyticsChartCard key={section.title} title={section.title} delay={0.15 + si * 0.05}>
            <div className="space-y-2">
              {section.data.slice(0, 5).map((d: Record<string, unknown>) => (
                <AnalyticsProgressBar key={String(d.name ?? d.code)} name={String(d.name ?? d.code ?? "—")} value={String(d.percentage)} percentage={Number(d.percentage)} />
              ))}
              {section.data.length === 0 && <p className="text-xs text-zinc-400">No data</p>}
            </div>
          </AnalyticsChartCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Top Landing Pages" delay={0.3}>
          {(topContent?.topPages as Array<Record<string, unknown>>)?.slice(0, 8).length > 0 ? (
            <div className="space-y-2">
              {(topContent?.topPages as Array<Record<string, unknown>>)?.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ExternalLink className="h-3 w-3 text-zinc-400 shrink-0" />
                    <span className="truncate text-zinc-700">{String(p.title ?? p.path ?? "Unknown")}</span>
                  </div>
                  <span className="shrink-0 ml-2 font-medium text-zinc-900">{String(p.views ?? 0)} views</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-zinc-400 py-4">No data yet</p>}
        </AnalyticsChartCard>
        <AnalyticsChartCard title="Top Search Queries" delay={0.35}>
          {(topContent?.topSearches as Array<Record<string, unknown>>)?.slice(0, 8).length > 0 ? (
            <div className="space-y-2">
              {(topContent?.topSearches as Array<Record<string, unknown>>)?.slice(0, 8).map((q, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Search className="h-3 w-3 text-zinc-400" />
                    <span className="text-zinc-700">{String(q.query ?? "Unknown")}</span>
                  </div>
                  <span className="font-medium text-zinc-900">{String(q.count ?? 0)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-zinc-400 py-4">No data yet</p>}
        </AnalyticsChartCard>
      </div>
    </>
  );
}
