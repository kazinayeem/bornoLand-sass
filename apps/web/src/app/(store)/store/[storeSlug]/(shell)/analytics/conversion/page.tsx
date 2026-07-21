"use client";

import { motion } from "framer-motion";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { useGetStoreConversionQuery, useGetStoreAnalyticsStatsQuery } from "@/redux/api/analytics-api";
import { ShoppingCart, Users, Eye, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { AnalyticsLoading, AnalyticsChartCard, AnalyticsEmptyState, formatNumber } from "@/components/store-dashboard/analytics/analytics-utils";

export default function ConversionPage() {
  const { storeId, isLoading } = useStorePage();
  const { data: conversionData, isLoading: convLoading } = useGetStoreConversionQuery(storeId!, { skip: !storeId });
  const { data: statsData } = useGetStoreAnalyticsStatsQuery(storeId!, { skip: !storeId });

  if (isLoading || !storeId) return <AnalyticsLoading />;

  const conversion = conversionData?.data as Record<string, unknown> | undefined;
  const stats = statsData?.data as Record<string, unknown> | undefined;

  if (convLoading) return <AnalyticsLoading />;

  if (!conversion) {
    return (
      <>
        <div>
          <h1 className="text-xl font-bold text-apple-ink">Conversion</h1>
          <p className="text-sm text-apple-ink-muted-48">Conversion funnel analysis</p>
        </div>
        <AnalyticsEmptyState icon={TrendingUp} title="No conversion data yet" description="Conversion data will appear once visitors interact with your store." />
      </>
    );
  }

  const funnelSteps = [
    { label: "Total Sessions", value: Number(conversion.totalSessions ?? 0), percentage: 100, icon: Users, color: "bg-blue-500" },
    { label: "Homepage Views", value: Number(conversion.homepageViews ?? 0), percentage: Number(conversion.totalSessions ?? 0) > 0 ? Math.round((Number(conversion.homepageViews ?? 0) / Number(conversion.totalSessions ?? 1)) * 100) : 0, icon: Eye, color: "bg-cyan-500" },
    { label: "Product Views", value: Number(conversion.productViews ?? 0), percentage: Number(conversion.totalSessions ?? 0) > 0 ? Math.round((Number(conversion.productViews ?? 0) / Number(conversion.totalSessions ?? 1)) * 100) : 0, icon: Eye, color: "bg-indigo-500" },
    { label: "Cart Views", value: Number(conversion.cartViews ?? 0), percentage: Number(conversion.totalSessions ?? 0) > 0 ? Math.round((Number(conversion.cartViews ?? 0) / Number(conversion.totalSessions ?? 1)) * 100) : 0, icon: ShoppingCart, color: "bg-amber-500" },
    { label: "Checkout Started", value: Number(conversion.checkoutViews ?? 0), percentage: Number(conversion.totalSessions ?? 0) > 0 ? Math.round((Number(conversion.checkoutViews ?? 0) / Number(conversion.totalSessions ?? 1)) * 100) : 0, icon: ShoppingCart, color: "bg-orange-500" },
    { label: "Orders Completed", value: Number(conversion.totalOrders ?? 0), percentage: Number(conversion.totalSessions ?? 0) > 0 ? Math.round((Number(conversion.totalOrders ?? 0) / Number(conversion.totalSessions ?? 1)) * 100) : 0, icon: TrendingUp, color: "bg-emerald-500" },
  ];

  const conversionRates = [
    { label: "Visit → Product", rate: `${String(conversion.cartConversion ?? "0.00")}%`, desc: "Product viewers who added to cart", color: "text-blue-600" },
    { label: "Cart → Checkout", rate: `${String(conversion.checkoutConversion ?? "0.00")}%`, desc: "Cart viewers who started checkout", color: "text-amber-600" },
    { label: "Checkout → Order", rate: `${String(conversion.orderConversion ?? "0.00")}%`, desc: "Checkout starters who completed order", color: "text-emerald-600" },
    { label: "Overall Conversion", rate: `${String(conversion.conversionRate ?? "0.00")}%`, desc: "Sessions that resulted in an order", color: "text-purple-600" },
  ];

  return (
    <>
      <div>
        <h1 className="text-xl font-bold text-apple-ink">Conversion Funnel</h1>
        <p className="text-sm text-apple-ink-muted-48">Track how visitors progress through your store</p>
      </div>

      {/* Conversion Rates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {conversionRates.map((cr, i) => (
          <motion.div key={cr.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-zinc-200 bg-white p-4 text-center">
            <p className="text-xs font-medium text-apple-ink-muted-48 mb-1">{cr.label}</p>
            <p className={`text-3xl font-bold ${cr.color}`}>{cr.rate}</p>
            <p className="text-[10px] text-apple-ink-muted-48 mt-1">{cr.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Funnel Chart */}
      <AnalyticsChartCard title="Conversion Funnel" delay={0.1}>
        <div className="space-y-2">
          {funnelSteps.map((step, i) => {
            const maxVal = funnelSteps[0].value;
            const width = maxVal > 0 ? (step.value / maxVal) * 100 : 0;
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-apple-ink-muted-48">{i + 1}</span>
                    <step.icon className="h-3.5 w-3.5 text-apple-ink-muted-48" />
                    <span className="font-medium text-apple-ink-muted-80">{step.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-apple-ink">{formatNumber(step.value)}</span>
                    <span className="text-apple-ink-muted-48 w-10 text-right">{step.percentage}%</span>
                  </div>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${width}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                    className={`h-full rounded-full ${step.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </AnalyticsChartCard>

      {/* Detailed metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCard title="Page View Breakdown" delay={0.2}>
          <div className="space-y-3">
            {[
              { label: "Homepage", views: Number(conversion.homepageViews ?? 0), unique: Number(conversion.homepageUnique ?? 0) },
              { label: "Products", views: Number(conversion.productViews ?? 0), unique: Number(conversion.productUnique ?? 0) },
              { label: "Categories", views: Number(conversion.categoryViews ?? 0) },
              { label: "Cart", views: Number(conversion.cartViews ?? 0) },
              { label: "Checkout", views: Number(conversion.checkoutViews ?? 0) },
              { label: "Order Success", views: Number(conversion.orderSuccessViews ?? 0) },
              { label: "Search", views: Number(conversion.searchViews ?? 0) },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-apple-ink-muted-80">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-apple-ink">{formatNumber(item.views)}</span>
                  {item.unique !== undefined && <span className="text-apple-ink-muted-48">({item.unique} unique)</span>}
                </div>
              </div>
            ))}
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Funnel Summary" delay={0.25}>
          <div className="space-y-4">
            <p className="text-sm text-apple-ink-muted-80">
              Out of <strong className="text-apple-ink">{formatNumber(Number(conversion.totalSessions ?? 0))}</strong> total sessions,
              <strong className="text-apple-ink"> {formatNumber(Number(conversion.totalOrders ?? 0))}</strong> resulted in orders.
            </p>
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 p-4 text-center">
              <p className="text-xs text-apple-ink-muted-48 mb-1">Overall Conversion Rate</p>
              <p className="text-4xl font-bold text-emerald-600">{String(conversion.conversionRate ?? "0.00")}%</p>
              <p className="text-xs text-apple-ink-muted-48 mt-1">
                {Number(conversion.totalOrders ?? 0)} orders from {formatNumber(Number(conversion.totalSessions ?? 0))} sessions
              </p>
            </div>
          </div>
        </AnalyticsChartCard>
      </div>
    </>
  );
}
