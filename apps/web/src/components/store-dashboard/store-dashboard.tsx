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
} from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { useGetStoreSubscriptionQuery } from "@/redux/api/subscription-api";
import { useGetStoreFeatureAccessQuery } from "@/redux/api/feature-api";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining, getStoreDisplayDomain } from "@/lib/store-status";
import { getStoreUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/language-provider";

/* ── Helpers ──────────────────────────────────────────────────── */

function formatBDT(value: number, isBn: boolean) {
  const formatted = new Intl.NumberFormat(isBn ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
  return formatted;
}

function formatCompact(value: number, isBn: boolean) {
  if (value >= 1_000_000) {
    const v = (value / 1_000_000).toFixed(1);
    return isBn ? `${v}M` : `${v}M`;
  }
  if (value >= 1_000) {
    const v = (value / 1_000).toFixed(1);
    return isBn ? `${v}K` : `${v}K`;
  }
  return String(value);
}

/* ── Animated Counter ─────────────────────────────────────────── */

function AnimatedNumber({ value, prefix = "", isBn = false }: { value: number; prefix?: string; isBn?: boolean }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayed(0);
      return;
    }
    const duration = 600;
    const start = performance.now();
    const from = displayed;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {prefix}
      {formatCompact(displayed, isBn)}
    </span>
  );
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all duration-200 hover:border-[#003399]/30 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      {children}
    </motion.div>
  );
});

/* ── Stat Card ────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  delay,
  isNumeric = false,
  numericValue = 0,
  isBn = false,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  trend?: string;
  delay: number;
  isNumeric?: boolean;
  numericValue?: number;
  isBn?: boolean;
}) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#0A8A00] border border-emerald-200">
            <TrendingUp className="h-2.5 w-2.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
        {isNumeric ? <AnimatedNumber value={numericValue} isBn={isBn} /> : value}
      </p>
      <p className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
    </DashboardCard>
  );
}

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
        <span className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">{usedLabel}</span>
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

/* ── Plan Card ────────────────────────────────────────────────── */

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
  labels: { title: string; features: string; managePlan: string; bandwidth: string };
}) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{labels.title}</h3>
        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-extrabold text-[#003399]">
          {planName}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2">
          <span className="text-zinc-500 font-medium">Storage</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{storage}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2">
          <span className="text-zinc-500 font-medium">{labels.bandwidth}</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{bandwidth}</span>
        </div>
      </div>
      {features.length > 0 && (
        <div className="mt-3.5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{labels.features}</p>
          <div className="flex flex-wrap gap-1.5">
            {features.slice(0, 4).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-700 dark:text-zinc-300"
              >
                <CheckCircle2 className="h-3 w-3 text-[#0A8A00]" />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
      <Link
        href={billingHref}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#003399] px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#002B80] transition-all"
      >
        <CreditCard className="h-3.5 w-3.5" />
        {labels.managePlan}
      </Link>
    </DashboardCard>
  );
}

/* ── Performance & Limits Card ────────────────────────────────── */

function PerformanceCard({
  productCount,
  orderCount,
  mediaCount,
  delay,
  labels,
  isBn,
}: {
  productCount: number;
  orderCount: number;
  mediaCount: number;
  delay: number;
  labels: { title: string; products: string; orders: string; media: string; pageViews: string };
  isBn: boolean;
}) {
  const metrics = [
    { label: labels.products, value: productCount, max: 500, color: "bg-emerald-500" },
    { label: labels.orders, value: orderCount, max: 1000, color: "bg-blue-600" },
    { label: labels.media, value: mediaCount, max: 200, color: "bg-purple-600" },
  ];

  return (
    <DashboardCard delay={delay}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">{labels.title}</h3>
      <div className="mt-4 space-y-3">
        {metrics.map((m) => {
          const pct = Math.min(100, Math.round((m.value / m.max) * 100));
          return (
            <div key={m.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{m.label}</span>
                <span className="font-mono font-bold text-zinc-500">{formatCompact(m.value, isBn)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={cn("h-full rounded-full", m.color)}
                />
              </div>
            </div>
          );
        })}
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
          <div key={item.label} className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/60 px-3.5 py-2">
            <span className="text-zinc-500 font-medium">{item.label}</span>
            <span className="max-w-[60%] truncate font-bold text-zinc-900 dark:text-zinc-100">{item.value}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

/* ── Main Store Dashboard Component ───────────────────────────── */

export function StoreDashboard({ store, storeId }: { store: Store; storeId: string }) {
  const { language, t } = useLanguage();
  const isBn = language === "bn";
  const d = t.dashboard;

  const { data: mediaStats } = useGetMediaStatsQuery(storeId, { skip: !storeId });
  const { data: subscriptionData } = useGetStoreSubscriptionQuery(storeId, { skip: !storeId });
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId, { skip: !storeId });

  const stats = mediaStats?.data?.stats;
  const subscription = subscriptionData?.data;
  const usage = subscription?.usage;
  const planName = typeof store.planId === "object" && store.planId ? store.planId.name : store.plan;
  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const trialDays = getTrialDaysRemaining(store.trialEndsAt);

  const features = accessData?.data?.features ?? [];
  const storeBase = `/store/${store.slug}`;
  const billingHref = `${storeBase}/billing`;

  const conversionRate = useMemo(() => {
    if (!store.orderCount || !store.productCount) return "0%";
    return `${((store.orderCount / store.productCount) * 100).toFixed(1)}%`;
  }, [store.orderCount, store.productCount]);

  // Dynamic Greeting based on current hour
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
        <div className="relative bg-gradient-to-r from-blue-50/50 via-white to-amber-50/30 p-6 sm:p-8 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className="text-[#003399] dark:text-[#FFDA1A] font-extrabold">{d.overviewSubtitle}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                {greeting}, <span className="text-[#003399] dark:text-[#FFDA1A]">{store.shortName || store.name}</span>
              </h1>

              {/* Status & Plan Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                    status === "active"
                      ? "bg-emerald-50 text-[#0A8A00] border-emerald-200"
                      : status === "trial"
                      ? "bg-blue-50 text-[#003399] border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  {statusConfig.label}
                </span>

                <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">
                  {planName || "Starter"}
                </span>

                {status === "trial" && trialDays !== null && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-[#003399]">
                    {d.plan.daysRemaining(trialDays)}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions Header Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`${storeBase}/builder`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#003399] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#002B80] transition-all"
              >
                <Palette className="h-4 w-4" />
                <span>{d.quickActions.builder}</span>
              </Link>

              <Link
                href={`${storeBase}/pos`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-900 shadow-2xs hover:bg-zinc-50 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <Calculator className="h-4 w-4 text-[#003399]" />
                <span>{d.quickActions.openPOS}</span>
              </Link>

              <a
                href={getStoreUrl(store.subdomain || store.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-900 shadow-2xs hover:bg-zinc-50 transition-all dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <Globe className="h-4 w-4" />
                <span>{d.quickActions.visitStore}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
              </a>

              <Link
                href={billingHref}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/60 px-4 py-2.5 text-xs font-bold text-purple-800 shadow-2xs hover:bg-purple-100 transition-all"
              >
                <CreditCard className="h-4 w-4 text-purple-700" />
                <span>{d.quickActions.upgradePlan}</span>
              </Link>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* ── Core KPI Cards ───────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={d.kpis.totalProducts}
          value={store.productCount ?? 0}
          isNumeric
          numericValue={store.productCount ?? 0}
          isBn={isBn}
          icon={Package}
          color="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.05}
        />
        <StatCard
          label={d.kpis.totalOrders}
          value={store.orderCount ?? 0}
          isNumeric
          numericValue={store.orderCount ?? 0}
          isBn={isBn}
          icon={ShoppingCart}
          color="text-blue-600"
          bg="bg-blue-50"
          trend="+14.2%"
          delay={0.1}
        />
        <StatCard
          label={d.kpis.totalRevenue}
          value={formatBDT(store.revenueBDT ?? 0, isBn)}
          icon={DollarSign}
          color="text-[#003399]"
          bg="bg-blue-50"
          trend="+22.8%"
          delay={0.15}
        />
        <StatCard
          label={d.kpis.conversionRate}
          value={conversionRate}
          icon={TrendingUp}
          color="text-purple-600"
          bg="bg-purple-50"
          delay={0.2}
        />
      </div>

      {/* ── Operational Quick Action Center Strip ───────────── */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          {d.quickActionsTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href={`${storeBase}/orders`}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-xs transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#003399]">
              <ShoppingCart className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{d.quickActions.newOrder}</p>
              <p className="text-[10px] text-zinc-500">Checkout / In-Store</p>
            </div>
          </Link>

          <Link
            href={`${storeBase}/products/new`}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-xs transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#0A8A00]">
              <Plus className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{d.quickActions.addProduct}</p>
              <p className="text-[10px] text-zinc-500">SKU & Variants</p>
            </div>
          </Link>

          <Link
            href={`${storeBase}/inventory/purchasing`}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-xs transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{d.quickActions.newPurchase}</p>
              <p className="text-[10px] text-zinc-500">Supplier POs</p>
            </div>
          </Link>

          <Link
            href={`${storeBase}/finance/expenses`}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/60 hover:bg-white hover:border-[#003399]/40 hover:shadow-xs transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{d.quickActions.addExpense}</p>
              <p className="text-[10px] text-zinc-500">Operating Costs</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Secondary Grid: Plan, Storage, Health, Details ───── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          planName={planName || "Starter"}
          features={features.map((f: any) => typeof f === "string" ? f : f.name || f.featureKey || "")}
          storage={usage?.storageLimitMB ? `${usage.storageLimitMB} MB` : "Unlimited"}
          bandwidth="Unlimited"
          billingHref={billingHref}
          delay={0.25}
          labels={d.plan}
        />

        <StorageCard
          usedMB={stats?.usedMB ?? usage?.storageMB ?? 0}
          limitMB={stats?.limitMB ?? usage?.storageLimitMB ?? 500}
          unlimited={stats?.unlimited ?? !usage?.storageLimitMB}
          percentUsed={stats?.percentUsed ?? (usage?.storageLimitMB ? Math.round(((usage?.storageMB ?? 0) / usage.storageLimitMB) * 100) : 0)}
          billingHref={billingHref}
          delay={0.3}
          labels={d.storage}
        />

        <PerformanceCard
          productCount={store.productCount ?? 0}
          orderCount={store.orderCount ?? 0}
          mediaCount={stats?.fileCount ?? 0}
          delay={0.35}
          labels={d.storeHealth}
          isBn={isBn}
        />
      </div>

      {/* ── Store Details ────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StoreDetailsCard
          store={store}
          planName={planName || "Starter"}
          delay={0.4}
          labels={d.storeDetails}
          isBn={isBn}
        />

        <DashboardCard delay={0.45}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              {d.activity.title}
            </h3>
            <span className="text-[11px] font-bold text-[#003399] dark:text-[#FFDA1A]">
              {d.activity.allTime}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{d.activity.storeCreated}</span>
              <span className="font-mono text-zinc-500">
                {new Date(store.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">{d.activity.lastUpdated}</span>
              <span className="font-mono text-zinc-500">
                {new Date(store.updatedAt).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {d.activity.allTimeOrders(store.orderCount ?? 0)}
              </span>
              <span className="font-mono font-bold text-[#0A8A00]">
                {formatBDT(store.revenueBDT ?? 0, isBn)}
              </span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
