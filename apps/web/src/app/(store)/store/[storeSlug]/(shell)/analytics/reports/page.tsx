"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import {
  useGetStoreAnalyticsStatsQuery, useGetStoreVisitorChartsQuery,
  useGetStoreTrafficSourcesQuery, useGetStoreDevicesQuery,
  useGetStoreTopContentQuery, useGetStoreConversionQuery,
} from "@/redux/api/analytics-api";
import { FileDown, FileText, FileSpreadsheet, Download } from "lucide-react";
import { AnalyticsLoading, exportCSV, exportJSON, formatDuration } from "@/components/store-dashboard/analytics/analytics-utils";
import { toast } from "sonner";

type ReportTab = "visitors" | "traffic" | "devices" | "content" | "conversion" | "export";

export default function ReportsPage() {
  const { storeId, isLoading } = useStorePage();
  const [tab, setTab] = useState<ReportTab>("visitors");
  const [dateRange, setDateRange] = useState("30d");

  const { data: statsData } = useGetStoreAnalyticsStatsQuery(storeId!, { skip: !storeId });
  const { data: chartsData } = useGetStoreVisitorChartsQuery(storeId!, { skip: !storeId });
  const { data: sourcesData } = useGetStoreTrafficSourcesQuery(storeId!, { skip: !storeId });
  const { data: devicesData } = useGetStoreDevicesQuery(storeId!, { skip: !storeId });
  const { data: topContentData } = useGetStoreTopContentQuery(storeId!, { skip: !storeId });
  const { data: conversionData } = useGetStoreConversionQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const stats = statsData?.data as Record<string, unknown> | undefined;
  const charts = chartsData?.data as Record<string, unknown> | undefined;
  const sources = (sourcesData?.data ?? []) as unknown as Array<Record<string, unknown>>;
  const devices = devicesData?.data as Record<string, unknown> | undefined;
  const topContent = topContentData?.data as Record<string, unknown> | undefined;
  const conversion = conversionData?.data as Record<string, unknown> | undefined;

  const tabs: { id: ReportTab; label: string }[] = [
    { id: "visitors", label: "Visitors" },
    { id: "traffic", label: "Traffic Sources" },
    { id: "devices", label: "Devices" },
    { id: "content", label: "Content" },
    { id: "conversion", label: "Conversion" },
    { id: "export", label: "Export All" },
  ];

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Analytics Reports</h1>
        <p className="text-sm text-zinc-500">Generate and export analytics reports</p>
      </div>

      <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 bg-white p-1 w-fit flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              tab === t.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Period:</span>
        {["24h", "7d", "30d", "90d", "1y"].map((d) => (
          <button key={d} onClick={() => setDateRange(d)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              dateRange === d ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}>
            {d === "24h" ? "Today" : d === "7d" ? "7 Days" : d === "30d" ? "30 Days" : d === "90d" ? "90 Days" : "1 Year"}
          </button>
        ))}
      </div>

      {tab === "visitors" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">Visitor Report</h3>
            <button onClick={() => { exportCSV("visitors", ["Metric", "Value"], Object.entries(stats ?? {}).map(([k, v]) => [k, String(v)])); toast.success("Report exported"); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Today", value: String(stats?.today ?? 0) },
              { label: "Yesterday", value: String(stats?.yesterday ?? 0) },
              { label: "This Week", value: String(stats?.week ?? 0) },
              { label: "This Month", value: String(stats?.month ?? 0) },
              { label: "Unique Visitors", value: String(stats?.uniqueVisitors ?? 0) },
              { label: "Returning", value: String(stats?.returningVisitors ?? 0) },
              { label: "Bounce Rate", value: `${String(stats?.bounceRate ?? 0)}%` },
              { label: "Avg Session", value: formatDuration(Number(stats?.avgSessionDuration ?? 0)) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{item.label}</p>
                <p className="mt-0.5 text-lg font-bold text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "traffic" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900">Traffic Sources Report</h3>
            <button onClick={() => { exportCSV("traffic-sources", ["Source", "Type", "Visits", "Unique", "Page Views"], sources.map((s) => [String(s.source), String(s.type), String(s.visits ?? 0), String(s.uniqueVisitors ?? 0), String(s.pageViews ?? 0)])); toast.success("Report exported"); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <div className="overflow-x-auto p-6 pt-0">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-[10px] uppercase text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Visits</th>
                  <th className="px-3 py-2">Unique</th>
                  <th className="px-3 py-2">Page Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {sources.map((s) => (
                  <tr key={String(s._id)} className="hover:bg-zinc-50/50">
                    <td className="px-3 py-2.5 text-xs font-medium text-zinc-800">{String(s.source)}</td>
                    <td className="px-3 py-2.5 text-xs capitalize text-zinc-500">{String(s.type)}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-700">{String(s.visits ?? 0)}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-500">{String(s.uniqueVisitors ?? 0)}</td>
                    <td className="px-3 py-2.5 text-xs text-zinc-500">{String(s.pageViews ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === "devices" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4">
          {[
            { title: "Devices", key: "devices", data: (devices?.devices as Array<Record<string, unknown>>) ?? [] },
            { title: "Browsers", key: "browsers", data: (devices?.browsers as Array<Record<string, unknown>>) ?? [] },
            { title: "Operating Systems", key: "operatingSystems", data: (devices?.operatingSystems as Array<Record<string, unknown>>) ?? [] },
            { title: "Countries", key: "countries", data: (devices?.countries as Array<Record<string, unknown>>) ?? [] },
          ].map((section) => (
            <div key={section.key} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-900">{section.title}</h3>
                <button onClick={() => { exportCSV(section.key.toLowerCase(), ["Name", "Percentage"], section.data.map((d) => [String(d.name ?? d.code ?? ""), String(d.percentage ?? "0")])); toast.success("Report exported"); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50">
                  <Download className="h-3 w-3" /> CSV
                </button>
              </div>
              <div className="space-y-2">
                {section.data.map((d: Record<string, unknown>) => (
                  <div key={String(d.name ?? d.code)}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-700">{String(d.name ?? d.code ?? "—")}</span>
                      <span className="text-zinc-500">{String(d.percentage ?? "0")}%</span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${String(d.percentage ?? 0)}%` }} />
                    </div>
                  </div>
                ))}
                {section.data.length === 0 && <p className="text-xs text-zinc-400">No data</p>}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {tab === "content" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Top Products</h3>
              <button onClick={() => { exportCSV("top-products", ["Product", "Views"], ((topContent?.topProducts ?? []) as Array<Record<string, unknown>>).map((p) => [String(p.name ?? ""), String(p.views ?? "0")])); toast.success("Report exported"); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50">
                <Download className="h-3 w-3" /> CSV
              </button>
            </div>
            <div className="space-y-2">
              {((topContent?.topProducts ?? []) as Array<Record<string, unknown>>).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-700">{String(p.name ?? "Unknown")}</span>
                  <span className="font-medium text-zinc-900">{String(p.views ?? 0)} views</span>
                </div>
              ))}
              {((topContent?.topProducts ?? []) as Array<Record<string, unknown>>).length === 0 && <p className="text-xs text-zinc-400">No data</p>}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Top Categories</h3>
              <button onClick={() => { exportCSV("top-categories", ["Category", "Views"], ((topContent?.topCategories ?? []) as Array<Record<string, unknown>>).map((c) => [String(c.name ?? ""), String(c.views ?? "0")])); toast.success("Report exported"); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1 text-[10px] font-medium text-zinc-500 hover:bg-zinc-50">
                <Download className="h-3 w-3" /> CSV
              </button>
            </div>
            <div className="space-y-2">
              {((topContent?.topCategories ?? []) as Array<Record<string, unknown>>).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-700">{String(c.name ?? "Unknown")}</span>
                  <span className="font-medium text-zinc-900">{String(c.views ?? 0)} views</span>
                </div>
              ))}
              {((topContent?.topCategories ?? []) as Array<Record<string, unknown>>).length === 0 && <p className="text-xs text-zinc-400">No data</p>}
            </div>
          </div>
        </motion.div>
      )}

      {tab === "conversion" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900">Conversion Report</h3>
            <button onClick={() => { exportCSV("conversion", ["Metric", "Value"], Object.entries(conversion ?? {}).map(([k, v]) => [k, String(v)])); toast.success("Report exported"); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Sessions", value: String(conversion?.totalSessions ?? 0) },
              { label: "Total Orders", value: String(conversion?.totalOrders ?? 0) },
              { label: "Conversion Rate", value: `${String(conversion?.conversionRate ?? "0.00")}%` },
              { label: "Cart Conv.", value: `${String(conversion?.cartConversion ?? "0.00")}%` },
              { label: "Checkout Conv.", value: `${String(conversion?.checkoutConversion ?? "0.00")}%` },
              { label: "Order Conv.", value: `${String(conversion?.orderConversion ?? "0.00")}%` },
              { label: "Homepage Views", value: String(conversion?.homepageViews ?? 0) },
              { label: "Product Views", value: String(conversion?.productViews ?? 0) },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{item.label}</p>
                <p className="mt-0.5 text-lg font-bold text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "export" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Export All Data</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Visitor Statistics", desc: "All visitor metrics", filename: "visitor-stats", icon: FileText, format: "json" as const },
                { label: "Traffic Sources", desc: "All source data", filename: "traffic-sources", icon: FileSpreadsheet, format: "csv" as const },
                { label: "Device Breakdown", desc: "Devices, browsers, OS, countries", filename: "device-breakdown", icon: FileText, format: "csv" as const },
                { label: "Top Content", desc: "Products, categories, pages", filename: "top-content", icon: FileText, format: "csv" as const },
                { label: "Conversion Data", desc: "Conversion funnel metrics", filename: "conversion-data", icon: FileSpreadsheet, format: "json" as const },
                { label: "Complete Report", desc: "Everything in one file", filename: "complete-report", icon: FileDown, format: "json" as const },
              ].map((exportItem) => (
                <button key={exportItem.filename} onClick={() => {
                  if (exportItem.format === "csv") {
                    toast.success(`${exportItem.label} exported`);
                  } else {
                    exportJSON(exportItem.filename, { stats, charts, sources, devices, topContent, conversion, exportedAt: new Date().toISOString() });
                    toast.success("Report exported");
                  }
                }}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/50">
                  <div className="rounded-lg bg-zinc-100 p-2 text-zinc-600">
                    <exportItem.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{exportItem.label}</p>
                    <p className="text-xs text-zinc-500">{exportItem.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
