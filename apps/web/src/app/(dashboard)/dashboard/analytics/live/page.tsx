"use client";

import { useMemo } from "react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetLiveVisitorsQuery } from "@/redux/api/analytics-api";
import {
  Users, Globe, Monitor, Smartphone, Tablet,
  Loader2, RefreshCw, ExternalLink, Clock, MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LiveVisitorsPage() {
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const storeId = stores[0]?._id ?? "";

  const storeOptions = useMemo(() => stores.map((s) => ({ id: s._id, name: s.name, slug: s.slug })), [stores]);

  const selectedStore = storeId;
  const { data, isLoading, refetch } = useGetLiveVisitorsQuery(selectedStore, {
    skip: !selectedStore,
    pollingInterval: 5000,
  });

  const liveData = data?.data as { visitors?: unknown[]; count?: number } | undefined;
  const visitors = (liveData?.visitors ?? []) as Array<Record<string, unknown>>;
  const count = liveData?.count ?? 0;

  if (!selectedStore) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-zinc-500">Create a store to view live visitors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-900">Live Visitors</h1>
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-emerald-700">{count} online</span>
            </div>
          </div>
          <p className="text-sm text-zinc-500">Real-time visitor activity — auto-refreshes every 5 seconds</p>
        </div>
        <button onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>
      ) : count === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <Users className="mb-3 h-12 w-12" />
          <p className="text-sm font-medium">No visitors online right now</p>
          <p className="text-xs">Live data will appear here once visitors are browsing your store.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-xs font-medium text-emerald-700">Online Now</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{count}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-500">Active Sessions</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{visitors.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-500">Unique Devices</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {new Set(visitors.map((v) => String(v.device ?? ""))).size}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-medium text-zinc-500">Countries</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">
                {new Set(visitors.map((v) => String(v.country ?? "Unknown"))).size}
              </p>
            </motion.div>
          </div>

          {/* Live Visitor Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-zinc-900">Active Sessions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-[10px] uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3">Visitor</th>
                    <th className="px-5 py-3">Current Page</th>
                    <th className="px-5 py-3">Device</th>
                    <th className="px-5 py-3">Browser</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Active For</th>
                    <th className="px-5 py-3">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {visitors.map((v) => {
                    const duration = Math.floor(
                      (Date.now() - new Date(String(v.lastActivity ?? v.createdAt ?? Date.now())).getTime()) / 1000
                    );
                    return (
                      <tr key={String(v._id)} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            <span className="text-xs font-mono text-zinc-500">
                              {String(v.visitorId ?? "").slice(-8)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3 text-zinc-400 shrink-0" />
                            <span className="text-xs text-zinc-700 truncate max-w-[200px]">
                              {String(v.currentPage ?? v.path ?? "—")}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            {String(v.device) === "Mobile" ? <Smartphone className="h-3 w-3 text-zinc-400" /> :
                             String(v.device) === "Tablet" ? <Tablet className="h-3 w-3 text-zinc-400" /> :
                             <Monitor className="h-3 w-3 text-zinc-400" />}
                            <span className="text-xs text-zinc-600">{String(v.device ?? "—")}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-zinc-600">{String(v.browser ?? "—")}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-zinc-400" />
                            <span className="text-xs text-zinc-600">{String(v.country ?? "—")}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            <span className="text-xs text-zinc-600">
                              {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m ${duration % 60}s`}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-zinc-400 max-w-[120px] truncate">
                          {String(v.referrer ?? "Direct")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Device / Browser / Country Distribution */}
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Devices",
                data: [...new Set(visitors.map((v) => String(v.device ?? "Unknown")))].map((d) => ({
                  name: d,
                  count: visitors.filter((v) => String(v.device ?? "Unknown") === d).length,
                })),
                icon: Monitor,
              },
              {
                title: "Browsers",
                data: [...new Set(visitors.map((v) => String(v.browser ?? "Unknown")))].map((b) => ({
                  name: b,
                  count: visitors.filter((v) => String(v.browser ?? "Unknown") === b).length,
                })),
                icon: Globe,
              },
              {
                title: "Countries",
                data: [...new Set(visitors.map((v) => String(v.country ?? "Unknown")))].map((c) => ({
                  name: c,
                  count: visitors.filter((v) => String(v.country ?? "Unknown") === c).length,
                })),
                icon: MapPin,
              },
            ].map((section, si) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + si * 0.05 }}
                className="rounded-xl border border-zinc-200 bg-white p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">{section.title}</h3>
                <div className="space-y-2">
                  {section.data.map((d) => {
                    const pct = count > 0 ? Math.round((d.count / count) * 100) : 0;
                    return (
                      <div key={d.name}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-700">{d.name}</span>
                          <span className="text-zinc-500">{d.count} ({pct}%)</span>
                        </div>
                        <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {section.data.length === 0 && <p className="text-xs text-zinc-400">No data</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
