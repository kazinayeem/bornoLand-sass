"use client";

import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreTrafficSourcesQuery } from "@/redux/api/analytics-api";
import { Link2, Globe } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { COLORS, AnalyticsLoading, AnalyticsChartCard, AnalyticsEmptyState } from "@/components/store-dashboard/analytics/analytics-utils";

export default function ReferrersPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: sourcesData, isLoading: sourcesLoading } = useGetStoreTrafficSourcesQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const sources = (sourcesData?.data ?? []) as unknown as Array<Record<string, unknown>>;
  const referrers = sources.filter((s) => String(s.type) === "referral");

  if (sourcesLoading) return <AnalyticsLoading />;

  if (referrers.length === 0) {
    return (
      <>
        <div>
          <h1 className="text-xl font-bold text-apple-ink">Referrers</h1>
          <p className="text-sm text-apple-ink-muted-48">Websites that refer traffic to your store</p>
        </div>
        <AnalyticsEmptyState icon={Link2} title="No referral data yet" description="Referral traffic appears when other websites link to your store." />
      </>
    );
  }

  const totalVisits = referrers.reduce((s, r) => s + Number(r.visits ?? 0), 0);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Referrers</h1>
        <p className="text-sm text-apple-ink-muted-48">Websites that refer traffic to your store</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Referrer Distribution" delay={0.1}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={referrers} dataKey="visits" nameKey="source"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={50}
                  label={({ source, percent }: any) => `${String(source ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {referrers.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-xl border border-apple-hairline bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-apple-ink">All Referrers</h3>
          <div className="space-y-2">
            {referrers.map((r) => (
              <div key={String(r._id)} className="flex items-center justify-between rounded-lg bg-apple-canvas-parchment p-3 text-xs">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                  <span className="font-medium text-apple-ink">{String(r.source)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-apple-ink-muted-48">{String(r.visits ?? 0)} visits</span>
                  <span className="text-apple-ink-muted-48 w-12 text-right">
                    {totalVisits > 0 ? `${((Number(r.visits ?? 0) / totalVisits) * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
