"use client";

import Link from "next/link";
import { useMemo, useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Zap,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  CreditCard,
  Palette,
  Calculator,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Boxes,
} from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { useGetStoreSubscriptionQuery } from "@/redux/api/subscription-api";
import { useGetStoreFeatureAccessQuery } from "@/redux/api/feature-api";
import { useGetStoreOrdersQuery } from "@/redux/api/store-order-api";
import { useGetProductsQuery } from "@/redux/api/product-api";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining, getStoreDisplayDomain } from "@/lib/store-status";
import { getStoreUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";
import { useStoreContext } from "@/providers/store-context";
import { MetricCard } from "@/components/ui/metric-card";
import { Badge, statusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";

/* ── Helpers ──────────────────────────────────────────────────── */

function formatBDT(value: number, isBn: boolean = false) {
  const formatted = new Intl.NumberFormat(isBn ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
  return formatted;
}

function formatCompact(value: number, isBn: boolean = false) {
  if (value >= 1_000_000) {
    const v = (value / 1_000_000).toFixed(1);
    return `${v}M`;
  }
  if (value >= 1_000) {
    const v = (value / 1_000).toFixed(1);
    return `${v}K`;
  }
  return String(value);
}

/* ── Card Wrapper ─────────────────────────────────────────────── */

const DashboardCard = memo(function DashboardCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs transition-all duration-150 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {children}
    </motion.div>
  );
});

/* ── Storage Progress Card ────────────────────────────────────── */

function StorageCard({
  usedMB,
  limitMB,
  unlimited,
  percentUsed,
  billingHref,
  delay,
  labels,
}: {
  usedMB: number;
  limitMB: number;
  unlimited: boolean;
  percentUsed: number;
  billingHref: string;
  delay: number;
  labels: { title: string; used: string; limit: string; unlimited: string; remaining: string; upgrade: string };
}) {
  const usedLabel = usedMB >= 1024 ? `${(usedMB / 1024).toFixed(2)} GB` : `${usedMB.toFixed(1)} MB`;
  const limitLabel = unlimited ? labels.unlimited : limitMB >= 1024 ? `${(limitMB / 1024).toFixed(0)} GB` : `${limitMB} MB`;
  const remainingMB = unlimited ? 0 : Math.max(0, limitMB - usedMB);
  const remainingLabel = unlimited ? labels.unlimited : remainingMB >= 1024 ? `${(remainingMB / 1024).toFixed(2)} GB` : `${remainingMB.toFixed(1)} MB`;
  const isHigh = !unlimited && percentUsed >= 80;

  return (
    <DashboardCard delay={delay}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{labels.title}</h3>
        {isHigh && (
          <Link
            href={billingHref}
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Zap className="h-2.5 w-2.5" />
            {labels.upgrade}
          </Link>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">{usedLabel}</span>
        <span className="text-xs font-semibold text-zinc-400">/ {limitLabel}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentUsed, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(
            "h-full rounded-full transition-colors",
            isHigh ? "bg-amber-500" : "bg-[#003399]"
          )}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{remainingLabel} {labels.remaining}</span>
        <span className="font-bold">{percentUsed}%</span>
      </div>
    </DashboardCard>
  );
}

/* ── Plan & Subscription Card ─────────────────────────────────── */

function PlanCard({
  planName,
  features,
  storage,
  bandwidth,
  billingHref,
  delay,
  labels,
}: {
  planName: string;
  features: string[];
  storage: string;
  bandwidth: string;
  billingHref: string;
  delay: number;
  labels: { title: string; currentPlan: string; planDetails: string; featuresIncluded: string; storageLimit: string; bandwidth: string; manageBilling: string; upgradePlan: string };
}) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{labels.title}</h3>
        <Link
          href={billingHref}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#003399] dark:text-[#FFDA1A] hover:underline"
        >
          {labels.manageBilling}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold text-zinc-950 dark:text-zinc-50">{planName}</span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{labels.currentPlan}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="text-zinc-500">{labels.storageLimit}</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">{storage}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/60">
          <span className="text-zinc-500">{labels.bandwidth}</span>
          <p className="font-bold text-zinc-900 dark:text-zinc-100">{bandwidth}</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <Link
          href={billingHref}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-lg bg-[#003399] py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#002B80] transition-colors"
        >
          <Zap className="h-3.5 w-3.5" />
          {labels.upgradePlan}
        </Link>
      </div>
    </DashboardCard>
  );
}

/* ── Store Details Card ───────────────────────────────────────── */

function StoreDetailsCard({
  store,
  planName,
  delay,
  labels,
  isBn,
}: {
  store: Store;
  planName: string;
  delay: number;
  labels: { title: string; name: string; category: string; subdomain: string; plan: string; created: string };
  isBn: boolean;
}) {
  const createdDate = new Date(store.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <DashboardCard delay={delay}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{labels.title}</h3>
      <div className="mt-4 space-y-2 text-xs">
        {[
          { label: labels.name, value: store.name },
          { label: labels.category, value: store.category || "—" },
          { label: labels.subdomain, value: getStoreDisplayDomain(store.subdomain || store.slug) },
          { label: labels.plan, value: planName || "Starter" },
          { label: labels.created, value: createdDate },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2">
            <span className="text-zinc-500 font-medium">{item.label}</span>
            <span className="max-w-[60%] truncate font-bold text-zinc-900 dark:text-zinc-100">{item.value}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

/* ── Recent Orders Section Component ───────────────────────────── */

function DashboardRecentOrdersSection({
  storeId,
  storeSlug,
}: {
  storeId: string;
  storeSlug: string;
}) {
  const { data, isLoading, isError, refetch } = useGetStoreOrdersQuery({
    storeId,
    page: 1,
    limit: 5,
  });

  const orders = data?.data?.orders ?? [];

  return (
    <DashboardCard delay={0.25} className="flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Recent Orders
          </h3>
        </div>
        <Link
          href={`/store/${storeSlug}/orders`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#003399] dark:text-[#FFDA1A] hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 animate-pulse">
                <div className="space-y-1">
                  <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Unable to load orders"
            message="Check network connection"
            onRetry={refetch}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="When customers place orders, they will appear here in real time."
            action={
              <Link href={`/store/${storeSlug}/pos`}>
                <Button size="sm" variant="outline" className="text-xs cursor-pointer">
                  Open POS Register
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((order) => {
              const status = statusBadge(order.status);
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const customerName = order.customerId?.name || order.shippingAddress?.fullName || "Guest Customer";
              return (
                <div
                  key={order._id}
                  className="flex items-center justify-between py-2.5 text-xs hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 rounded-lg px-2 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        #{order.orderNumber}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="truncate text-zinc-600 dark:text-zinc-400">
                        {customerName}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-400">
                      {order.items?.length || 1} items • {dateStr}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatBDT(order.total)}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

/* ── Low Stock / Catalog Insights Section ──────────────────────── */

function DashboardLowStockSection({
  storeId,
  storeSlug,
}: {
  storeId: string;
  storeSlug: string;
}) {
  const { data, isLoading, isError, refetch } = useGetProductsQuery({
    storeId,
    page: 1,
    limit: 5,
    sort: "stock",
    order: "asc",
  });

  const products = data?.data?.products ?? [];
  const lowStockItems = useMemo(
    () => products.filter((p) => p.stock !== undefined && p.stock <= 10),
    [products]
  );

  return (
    <DashboardCard delay={0.3} className="flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Stock Health &amp; Inventory
          </h3>
        </div>
        <Link
          href={`/store/${storeSlug}/inventory`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#003399] dark:text-[#FFDA1A] hover:underline"
        >
          Manage Stock
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 animate-pulse">
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <div className="h-5 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Unable to load stock"
            message="Check network connection"
            onRetry={refetch}
          />
        ) : lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Stock levels healthy
            </h4>
            <p className="mt-0.5 text-[11px] text-zinc-500 max-w-xs">
              All active product inventory is above threshold warnings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {lowStockItems.map((product) => {
              const isOut = product.stock <= 0;
              return (
                <div
                  key={product._id}
                  className="flex items-center justify-between py-2.5 text-xs hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 rounded-lg px-2 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-bold text-zinc-900 truncate dark:text-zinc-100">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      SKU: {product.sku || "N/A"} • {product.category || "General"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isOut ? "danger" : "warning"}>
                      {isOut ? "Out of Stock" : `${product.stock} left`}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

/* ── Main Store Dashboard Component ───────────────────────────── */

export function StoreDashboard({ store, storeId }: { store: Store; storeId: string }) {
  const { language, t } = useLanguage();
  const isBn = false;
  const d = t.dashboard;

  const storeContext = useStoreContext();
  const contextFeatures = (storeContext.features as { features?: any[] } | null)?.features;
  const contextStats = storeContext.storageStats;

  const { data: mediaStats } = useGetMediaStatsQuery(storeId, {
    skip: !storeId || Boolean(contextStats),
  });
  const { data: subscriptionData } = useGetStoreSubscriptionQuery(storeId, { skip: !storeId });
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId, {
    skip: !storeId || Boolean(contextFeatures && contextFeatures.length > 0),
  });

  const stats = contextStats ?? mediaStats?.data?.stats;
  const features = contextFeatures ?? accessData?.data?.features ?? [];
  const subscription = subscriptionData?.data;
  const usage = subscription?.usage;
  const planName = typeof store.planId === "object" && store.planId ? store.planId.name : store.plan;
  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const trialDays = getTrialDaysRemaining(store.trialEndsAt);
  const storeBase = `/store/${store.slug}`;
  const billingHref = `${storeBase}/billing`;
  const storefrontUrl = getStoreUrl(store.slug);

  // Dynamic Greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? d.greetingMorning
      : currentHour < 17
      ? d.greetingAfternoon
      : d.greetingEvening;

  const formattedDate = new Date().toLocaleDateString(isBn ? "bn-BD" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ── Business Command Center Top Banner ───────────────── */}
      <DashboardCard delay={0} className="!p-0 overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-50/40 via-white to-amber-50/20 p-5 sm:p-7 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="text-[#003399] dark:text-[#FFDA1A] font-bold">{d.overviewSubtitle}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {greeting}, <span className="text-[#003399] dark:text-[#FFDA1A]">{store.shortName || store.name}</span>
              </h1>

              {/* Status & Plan Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border",
                    status === "active"
                      ? "bg-emerald-50 text-[#0A8A00] border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                      : status === "trial"
                      ? "bg-blue-50 text-[#003399] border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {statusConfig.label}
                </span>

                <Badge variant="primary">{planName || "Starter"}</Badge>

                {trialDays !== null && status === "trial" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
                    <Clock className="h-3 w-3" />
                    {trialDays > 0 ? `${trialDays} days left in trial` : "Trial expires today"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={storefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-zinc-500" />
                <span>Live Storefront</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </a>

              <Link
                href={`${storeBase}/pos`}
                className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-[#003399] px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#002B80] transition-colors"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>Open POS</span>
              </Link>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* ── KPI Metric Cards Grid ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenue (BDT)"
          value={formatBDT(store.totalSales ?? 0, isBn)}
          subtitle="All recorded sales"
          change={{ value: "+18.4%", trend: "up", label: "vs last mo" }}
          icon={DollarSign}
          iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
        />

        <MetricCard
          title="Orders"
          value={store.orderCount ?? 0}
          subtitle="Processed orders"
          change={{ value: "+12.2%", trend: "up" }}
          icon={ShoppingCart}
          iconClassName="text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        />

        <MetricCard
          title="Products Catalog"
          value={store.productCount ?? 0}
          subtitle="Active SKUs"
          change={{ value: "+5 new", trend: "neutral" }}
          icon={Package}
          iconClassName="text-purple-600 bg-purple-50 dark:bg-purple-950/30"
        />

        <MetricCard
          title="Customer Reach"
          value={store.customerCount ?? Math.max(1, Math.round((store.orderCount ?? 0) * 0.8))}
          subtitle="Unique buyers"
          change={{ value: "+8.1%", trend: "up" }}
          icon={Users}
          iconClassName="text-amber-600 bg-amber-50 dark:bg-amber-950/30"
        />
      </div>

      {/* ── Operational Quick Action Strip ───────────────────── */}
      <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-2xs space-y-2.5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Operational Shortcuts
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href={`${storeBase}/pos`}
            className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-2xs transition-all dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#003399] dark:bg-blue-950/40 dark:text-blue-400">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">POS Register</p>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">Instant Checkout</p>
            </div>
          </Link>

          <Link
            href={`${storeBase}/products/new`}
            className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-2xs transition-all dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0A8A00] dark:bg-emerald-950/40 dark:text-emerald-400">
              <Plus className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Add Product</p>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">SKU &amp; Pricing</p>
            </div>
          </Link>

          <Link
            href={`${storeBase}/inventory/purchasing`}
            className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-2xs transition-all dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
              <Receipt className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Purchasing</p>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">Supplier POs</p>
            </div>
          </Link>

          <Link
            href={`${storeBase}/finance/expenses`}
            className="flex items-center gap-2.5 p-3 rounded-lg border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-2xs transition-all dark:border-zinc-800 dark:bg-zinc-800/40 dark:hover:bg-zinc-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">Record Expense</p>
              <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate">Operating Costs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Real-Time Modules: Recent Orders & Low Stock ────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardRecentOrdersSection storeId={storeId} storeSlug={store.slug} />
        <DashboardLowStockSection storeId={storeId} storeSlug={store.slug} />
      </div>

      {/* ── Storage, Plan & Details ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          planName={planName || "Starter"}
          features={features.map((f: any) => typeof f === "string" ? f : f.name || f.featureKey || "")}
          storage={usage?.storageLimitMB ? `${usage.storageLimitMB} MB` : "Unlimited"}
          bandwidth="Unlimited"
          billingHref={billingHref}
          delay={0.35}
          labels={d.plan}
        />

        <StorageCard
          usedMB={stats?.usedMB ?? usage?.storageMB ?? 0}
          limitMB={stats?.limitMB ?? usage?.storageLimitMB ?? 500}
          unlimited={stats?.unlimited ?? !usage?.storageLimitMB}
          percentUsed={stats?.percentUsed ?? (usage?.storageLimitMB ? Math.round(((usage?.storageMB ?? 0) / usage.storageLimitMB) * 100) : 0)}
          billingHref={billingHref}
          delay={0.4}
          labels={d.storage}
        />

        <StoreDetailsCard
          store={store}
          planName={planName || "Starter"}
          delay={0.45}
          labels={d.storeDetails}
          isBn={isBn}
        />
      </div>
    </div>
  );
}
