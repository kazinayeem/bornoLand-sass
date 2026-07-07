"use client";

import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreTrafficSourcesQuery } from "@/redux/api/analytics-api";
import { Target, Globe } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { COLORS, AnalyticsLoading, AnalyticsChartCard, AnalyticsEmptyState } from "@/components/store-dashboard/analytics/analytics-utils";

export default function CampaignsPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: sourcesData, isLoading: sourcesLoading } = useGetStoreTrafficSourcesQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const sources = (sourcesData?.data ?? []) as unknown as Array<Record<string, unknown>>;
  const campaigns = sources.filter((s) => String(s.type) === "utm" || String(s.campaign));

  if (sourcesLoading) return <AnalyticsLoading />;

  if (campaigns.length === 0) {
    return (
      <>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Campaigns</h1>
          <p className="text-sm text-zinc-500">UTM campaign performance tracking</p>
        </div>
        <AnalyticsEmptyState icon={Target} title="No campaign data yet" description="Campaign traffic appears when you use UTM parameters in your marketing links." />
      </>
    );
  }

  const totalVisits = campaigns.reduce((s, c) => s + Number(c.visits ?? 0), 0);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Campaigns</h1>
        <p className="text-sm text-zinc-500">UTM campaign performance tracking</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Campaign Distribution" delay={0.1}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={campaigns} dataKey="visits" nameKey="source"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={50}
                  label={({ source, percent }: any) => `${String(source ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {campaigns.map((_, i) => (
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
          className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">All Campaigns</h3>
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={String(c._id)} className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Target className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="font-medium text-zinc-800 truncate">{String(c.source)}</span>
                  {String(c.campaign) && <span className="text-zinc-400 text-[10px] truncate">({String(c.campaign)})</span>}
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-3">
                  <span className="text-zinc-500">{String(c.visits ?? 0)} visits</span>
                  <span className="text-zinc-400 w-12 text-right">
                    {totalVisits > 0 ? `${((Number(c.visits ?? 0) / totalVisits) * 100).toFixed(1)}%` : "—"}
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
