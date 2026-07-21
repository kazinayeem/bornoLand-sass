"use client";

import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreTopContentQuery, useGetStoreVisitorChartsQuery } from "@/redux/api/analytics-api";
import { ExternalLink, Loader2 } from "lucide-react";
import { AnalyticsLoading, AnalyticsChartCard, AnalyticsEmptyState } from "@/components/store-dashboard/analytics/analytics-utils";

export default function PagesPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: topContentData, isLoading: contentLoading } = useGetStoreTopContentQuery(storeId!, { skip: !storeId });
  const { data: chartsData, isLoading: chartsLoading } = useGetStoreVisitorChartsQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const topContent = topContentData?.data as Record<string, unknown> | undefined;
  const charts = chartsData?.data as Record<string, unknown> | undefined;

  const topPages = (topContent?.topPages as Array<Record<string, unknown>>) ?? [];
  const topPagesFromCharts = (charts?.topPages as Array<Record<string, unknown>>) ?? [];

  if (contentLoading || chartsLoading) return <AnalyticsLoading />;

  if (topPages.length === 0 && topPagesFromCharts.length === 0) {
    return (
      <>
        <div>
          <h1 className="text-xl font-bold text-apple-ink">Pages</h1>
          <p className="text-sm text-apple-ink-muted-48">Most viewed pages on your store</p>
        </div>
        <AnalyticsEmptyState icon={ExternalLink} title="No page data yet" description="Page view data will appear once visitors browse your store." />
      </>
    );
  }

  const allPages = topPages.length > 0 ? topPages : topPagesFromCharts;
  const topLanding = [...allPages].sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0)).slice(0, 10);

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Pages</h1>
        <p className="text-sm text-apple-ink-muted-48">Most viewed pages on your store — this month</p>
      </div>

      <AnalyticsChartCard title="Top Landing Pages" delay={0.1}>
        {topLanding.length > 0 ? (
          <div className="space-y-2">
            {topLanding.map((p, i) => (
              <motion.div key={String(p.url ?? i)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between rounded-lg bg-apple-canvas-parchment px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-apple-ink-muted-80">
                    {i + 1}
                  </span>
                  <ExternalLink className="h-3 w-3 text-apple-ink-muted-48 shrink-0" />
                  <span className="truncate text-apple-ink-muted-80">{String(p.title ?? p.url ?? p.path ?? "Unknown")}</span>
                </div>
                <span className="ml-3 shrink-0 font-semibold text-apple-ink">{String(p.views ?? 0)} views</span>
              </motion.div>
            ))}
          </div>
        ) : <p className="text-xs text-apple-ink-muted-48 py-4">No data yet</p>}
      </AnalyticsChartCard>

      {/* Top Products & Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Most Viewed Products" delay={0.15}>
          {((topContent?.topProducts ?? []) as Array<Record<string, unknown>>).length > 0 ? (
            <div className="space-y-2">
              {((topContent?.topProducts ?? []) as Array<Record<string, unknown>>).slice(0, 10).map((p, i) => (
                <div key={String(p.productId ?? i)} className="flex items-center justify-between text-xs">
                  <span className="truncate text-apple-ink-muted-80">{String(p.name ?? "Unknown")}</span>
                  <span className="ml-2 shrink-0 font-medium text-apple-ink">{String(p.views ?? 0)} views</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-apple-ink-muted-48 py-4">No product view data yet</p>}
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Most Viewed Categories" delay={0.2}>
          {((topContent?.topCategories ?? []) as Array<Record<string, unknown>>).length > 0 ? (
            <div className="space-y-2">
              {((topContent?.topCategories ?? []) as Array<Record<string, unknown>>).slice(0, 10).map((c, i) => (
                <div key={String(c.categoryId ?? i)} className="flex items-center justify-between text-xs">
                  <span className="truncate text-apple-ink-muted-80">{String(c.name ?? "Unknown")}</span>
                  <span className="ml-2 shrink-0 font-medium text-apple-ink">{String(c.views ?? 0)} views</span>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-apple-ink-muted-48 py-4">No category view data yet</p>}
        </AnalyticsChartCard>
      </div>
    </>
  );
}
