"use client";

import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreDevicesQuery } from "@/redux/api/analytics-api";
import { Globe } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { COLORS, AnalyticsLoading, AnalyticsChartCard, AnalyticsProgressBar } from "@/components/store-dashboard/analytics/analytics-utils";

export default function BrowsersPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: devicesData, isLoading: devicesLoading } = useGetStoreDevicesQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId || devicesLoading) return <AnalyticsLoading />;

  const browsers = (devicesData?.data as Record<string, unknown> | undefined)?.browsers as Array<Record<string, unknown>> ?? [];

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Browsers</h1>
        <p className="text-sm text-zinc-500">Browser breakdown of your visitors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Browser Distribution" delay={0.1}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={browsers} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                  label={({ name, percent }: any) => `${String(name ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {browsers.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Browser Breakdown" delay={0.15}>
          <div className="space-y-4">
            {browsers.slice(0, 10).map((b, i) => (
              <div key={String(b.name)} className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-zinc-800">{String(b.name)}</span>
                    <span className="text-xs font-semibold text-zinc-600">{String(b.count)}</span>
                  </div>
                  <AnalyticsProgressBar name="" value={String(b.percentage)} percentage={Number(b.percentage)} color={`hsl(${i * 40}, 60%, 50%)`} />
                </div>
              </div>
            ))}
            {browsers.length === 0 && <p className="text-xs text-zinc-400 py-8 text-center">No browser data yet</p>}
          </div>
        </AnalyticsChartCard>
      </div>
    </>
  );
}
