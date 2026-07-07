"use client";

import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreDevicesQuery } from "@/redux/api/analytics-api";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { COLORS, AnalyticsLoading, AnalyticsChartCard, AnalyticsProgressBar } from "@/components/store-dashboard/analytics/analytics-utils";

export default function DevicesPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: devicesData, isLoading: devicesLoading } = useGetStoreDevicesQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId || devicesLoading) return <AnalyticsLoading />;

  const devices = (devicesData?.data as Record<string, unknown> | undefined)?.devices as Array<Record<string, unknown>> ?? [];

  const deviceIcons: Record<string, typeof Monitor> = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Devices</h1>
        <p className="text-sm text-zinc-500">Device type breakdown of your visitors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Device Distribution" delay={0.1}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={devices} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                  label={({ name, percent }: any) => `${String(name ?? "")} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {devices.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: "8px", fontSize: "12px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Device Breakdown" delay={0.15}>
          <div className="space-y-6">
            {devices.map((d) => {
              const Icon = deviceIcons[String(d.name)] ?? Monitor;
              return (
                <div key={String(d.name)} className="flex items-center gap-4">
                  <div className="rounded-lg bg-zinc-100 p-3">
                    <Icon className="h-6 w-6 text-zinc-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-900">{String(d.name)}</span>
                      <span className="text-sm font-bold text-zinc-900">{String(d.count)}</span>
                    </div>
                    <AnalyticsProgressBar name="" value={String(d.percentage)} percentage={Number(d.percentage)} color="bg-blue-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </AnalyticsChartCard>
      </div>
    </>
  );
}
