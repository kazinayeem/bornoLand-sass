"use client";

import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreDevicesQuery } from "@/redux/api/analytics-api";
import { MapPin } from "lucide-react";
import { COLORS, AnalyticsLoading, AnalyticsChartCard, AnalyticsProgressBar } from "@/components/store-dashboard/analytics/analytics-utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function CountriesPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: devicesData, isLoading: devicesLoading } = useGetStoreDevicesQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId || devicesLoading) return <AnalyticsLoading />;

  const countries = (devicesData?.data as Record<string, unknown> | undefined)?.countries as Array<Record<string, unknown>> ?? [];

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Countries</h1>
        <p className="text-sm text-apple-ink-muted-48">Geographic distribution of your visitors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Country Distribution" delay={0.1}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={countries.slice(0, 10)} dataKey="count" nameKey="code"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                  label={({ code, percent }: any) => `${String(code ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {countries.slice(0, 10).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Country Breakdown" delay={0.15}>
          <div className="space-y-3">
            {countries.slice(0, 15).map((c, i) => (
              <div key={String(c.code)} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-apple-ink-muted-80 uppercase">
                  {String(c.code ?? "??").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-zinc-800">{String(c.code)}</span>
                    <span className="text-xs font-semibold text-apple-ink-muted-80">{String(c.count)}</span>
                  </div>
                  <AnalyticsProgressBar name="" value={String(c.percentage)} percentage={Number(c.percentage)} color={`hsl(${180 + i * 15}, 50%, 50%)`} />
                </div>
              </div>
            ))}
            {countries.length === 0 && <p className="text-xs text-apple-ink-muted-48 py-8 text-center">No country data yet</p>}
          </div>
        </AnalyticsChartCard>
      </div>
    </>
  );
}
