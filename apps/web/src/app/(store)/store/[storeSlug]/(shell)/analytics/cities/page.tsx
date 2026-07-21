"use client";

import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreCitiesQuery } from "@/redux/api/analytics-api";
import { Building } from "lucide-react";
import { AnalyticsLoading, AnalyticsEmptyState } from "@/components/store-dashboard/analytics/analytics-utils";
import { motion } from "framer-motion";

export default function CitiesPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: citiesData, isLoading: citiesLoading } = useGetStoreCitiesQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const cities = (citiesData?.data ?? []) as unknown as Array<Record<string, unknown>>;

  if (citiesLoading) return <AnalyticsLoading />;

  if (cities.length === 0) {
    return (
      <>
        <div>
          <h1 className="text-xl font-bold text-apple-ink">Cities</h1>
          <p className="text-sm text-apple-ink-muted-48">City-level breakdown of your visitors</p>
        </div>
        <AnalyticsEmptyState icon={Building} title="No city data yet" description="City data will appear once visitors browse your store." />
      </>
    );
  }

  const maxCount = Math.max(...cities.map((c) => Number(c.count ?? 0)), 1);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Cities</h1>
        <p className="text-sm text-apple-ink-muted-48">City-level breakdown of your visitors — this month</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city, i) => (
          <motion.div key={String(city.city ?? i)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
            className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Building className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-apple-ink truncate">{String(city.city ?? "Unknown")}</p>
                <p className="text-xs text-apple-ink-muted-48">{String(city.country ?? "")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-apple-ink-muted-48">{String(city.count ?? 0)} visits</span>
              <span className="text-apple-ink-muted-48">{String(city.uniqueVisitors ?? 0)} unique</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(Number(city.count ?? 0) / maxCount) * 100}%` }} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-zinc-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-apple-ink">All Cities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-apple-canvas-parchment text-left text-[10px] uppercase tracking-wider text-apple-ink-muted-48">
              <tr>
                <th className="px-4 py-2">City</th>
                <th className="px-4 py-2">Country</th>
                <th className="px-4 py-2">Visits</th>
                <th className="px-4 py-2">Unique Visitors</th>
                <th className="px-4 py-2">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {cities.map((city, i) => {
                const total = cities.reduce((s, c) => s + Number(c.count ?? 0), 0);
                return (
                  <tr key={String(city.city ?? i)} className="hover:bg-apple-canvas-parchment/50">
                    <td className="px-4 py-2.5 text-xs font-medium text-zinc-800">{String(city.city ?? "Unknown")}</td>
                    <td className="px-4 py-2.5 text-xs text-apple-ink-muted-48">{String(city.country ?? "—")}</td>
                    <td className="px-4 py-2.5 text-xs font-medium text-apple-ink">{String(city.count ?? 0)}</td>
                    <td className="px-4 py-2.5 text-xs text-apple-ink-muted-48">{String(city.uniqueVisitors ?? 0)}</td>
                    <td className="px-4 py-2.5 text-xs text-apple-ink-muted-48">
                      {total > 0 ? `${((Number(city.count ?? 0) / total) * 100).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
