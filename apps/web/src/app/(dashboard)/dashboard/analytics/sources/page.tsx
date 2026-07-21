"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetStoreTrafficSourcesQuery, useGetStoreDevicesQuery, useGetStoreTopContentQuery } from "@/redux/api/analytics-api";
import { Globe, Search, ExternalLink, Monitor, Smartphone, Tablet, MapPin, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

export default function TrafficSourcesPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const storeId = stores[0]?._id ?? "";

  const { data: sourcesData, isLoading } = useGetStoreTrafficSourcesQuery(storeId, { skip: !storeId });
  const { data: devicesData } = useGetStoreDevicesQuery(storeId, { skip: !storeId });
  const { data: topContentData } = useGetStoreTopContentQuery(storeId, { skip: !storeId });

  const sources = (sourcesData?.data ?? []) as unknown as Array<Record<string, unknown>>;
  const devices = devicesData?.data as Record<string, unknown> | undefined;
  const topContent = topContentData?.data as Record<string, unknown> | undefined;

  const [filter, setFilter] = useState("all");
  const filteredSources = filter === "all" ? sources : sources.filter((s) => String(s.type) === filter);

  const sourceTypes = useMemo(() => [...new Set(sources.map((s) => String(s.type)))], [sources]);

  if (!storeId) {
    return <div className="flex h-[60vh] items-center justify-center"><p className="text-apple-ink-muted-48">Create a store to view traffic sources.</p></div>;
  }

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }

  const totalVisits = sources.reduce((sum, s) => sum + Number(s.visits ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Traffic Sources</h1>
        <p className="text-sm text-apple-ink-muted-48">Where your visitors come from</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-apple-ink-muted-48">Total Visits</p>
          <p className="mt-1 text-2xl font-bold text-apple-ink">{totalVisits}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-apple-ink-muted-48">Traffic Sources</p>
          <p className="mt-1 text-2xl font-bold text-apple-ink">{sources.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-apple-ink-muted-48">Unique Visitors</p>
          <p className="mt-1 text-2xl font-bold text-apple-ink">
            {sources.reduce((sum, s) => sum + Number(s.uniqueVisitors ?? 0), 0)}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-apple-ink-muted-48">Page Views</p>
          <p className="mt-1 text-2xl font-bold text-apple-ink">
            {sources.reduce((sum, s) => sum + Number(s.pageViews ?? 0), 0)}
          </p>
        </motion.div>
      </div>

      {/* Traffic Sources Pie + Table */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">Distribution</h3>
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
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-apple-ink">All Sources</h3>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-apple-ink-muted-80 outline-none focus:border-blue-400">
              <option value="all">All Types</option>
              {sourceTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-apple-canvas-parchment text-left text-[10px] uppercase tracking-wider text-apple-ink-muted-48">
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
                  <tr key={String(s._id)} className="hover:bg-apple-canvas-parchment/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                        <span className="text-xs font-medium text-zinc-800">{String(s.source)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-apple-ink-muted-80 capitalize">
                        {String(s.type)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs font-medium text-apple-ink">{String(s.visits ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-apple-ink-muted-80">{String(s.uniqueVisitors ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-apple-ink-muted-80">{String(s.pageViews ?? 0)}</td>
                    <td className="px-5 py-3 text-xs text-apple-ink-muted-48">
                      {totalVisits > 0 ? `${((Number(s.visits ?? 0) / totalVisits) * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Device / Browser / OS / Country */}
      <div className="grid gap-6 lg:grid-cols-4">
        {[
          { title: "Devices", data: (devices?.devices as Array<Record<string, unknown>>) ?? [] },
          { title: "Browsers", data: (devices?.browsers as Array<Record<string, unknown>>) ?? [] },
          { title: "OS", data: (devices?.operatingSystems as Array<Record<string, unknown>>) ?? [] },
          { title: "Countries", data: (devices?.countries as Array<Record<string, unknown>>) ?? [] },
        ].map((section, si) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + si * 0.05 }}
            className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">{section.title}</h3>
            <div className="space-y-2">
              {section.data.slice(0, 5).map((d: Record<string, unknown>) => (
                <div key={String(d.name ?? d.code)}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-apple-ink-muted-80">{String(d.name ?? d.code ?? "—")}</span>
                    <span className="text-apple-ink-muted-48">{String(d.percentage ?? "0")}%</span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${String(d.percentage ?? 0)}%` }} />
                  </div>
                </div>
              ))}
              {section.data.length === 0 && <p className="text-xs text-apple-ink-muted-48">No data</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Top Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">Top Landing Pages</h3>
          {(topContent?.topPages as Array<Record<string, unknown>>)?.slice(0, 8).length > 0 ? (
            <div className="space-y-2">
              {(topContent?.topPages as Array<Record<string, unknown>>)?.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ExternalLink className="h-3 w-3 text-apple-ink-muted-48 shrink-0" />
                    <span className="truncate text-apple-ink-muted-80">{String(p.title ?? p.path ?? "Unknown")}</span>
                  </div>
                  <span className="shrink-0 ml-2 font-medium text-apple-ink">{String(p.views ?? 0)} views</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-apple-ink-muted-48 py-4">No data yet</p>}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">Top Search Queries</h3>
          {(topContent?.topSearches as Array<Record<string, unknown>>)?.slice(0, 8).length > 0 ? (
            <div className="space-y-2">
              {(topContent?.topSearches as Array<Record<string, unknown>>)?.slice(0, 8).map((q, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Search className="h-3 w-3 text-apple-ink-muted-48" />
                    <span className="text-apple-ink-muted-80">{String(q.query ?? "Unknown")}</span>
                  </div>
                  <span className="font-medium text-apple-ink">{String(q.count ?? 0)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-apple-ink-muted-48 py-4">No data yet</p>}
        </motion.div>
      </div>
    </div>
  );
}
