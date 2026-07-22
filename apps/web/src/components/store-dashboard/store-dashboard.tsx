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
  Eye,
  Sparkles,
  ArrowUpRight,
  Image,
  Tags,
  Ticket,
  BarChart3,
  FileText,
  Plus,
  Zap,
  Shield,
  Clock,
  Globe,
  ArrowRight,
  CreditCard,
  Palette,
} from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { useGetStoreSubscriptionQuery } from "@/redux/api/subscription-api";
import { useGetStoreFeatureAccessQuery } from "@/redux/api/feature-api";
import { resolveStoreStatus, storeStatusConfig, getTrialDaysRemaining, getStoreDisplayDomain } from "@/lib/store-status";
import { getStoreUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

/* ── Helpers ──────────────────────────────────────────────────── */

function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

/* ── Animated Counter ─────────────────────────────────────────── */

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
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
  return <span>{prefix}{formatCompact(displayed)}</span>;
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "rounded-apple-lg border border-apple-hairline bg-apple-canvas p-apple-lg transition-colors duration-200",
        "hover:border-apple-primary/20",
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
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  trend?: string;
  delay: number;
}) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105", bg)}>
          <Icon className={cn("h-[18px] w-[18px]", color)} />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <TrendingUp className="h-2.5 w-2.5" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-apple-ink">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-apple-ink-muted-48">{label}</p>
    </DashboardCard>
  );
}

/* ── Quick Action Card ────────────────────────────────────────── */

function QuickActionCard({
  label,
  description,
  icon: Icon,
  href,
  color,
  bg,
  delay,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bg: string;
  delay: number;
}) {
  return (
    <DashboardCard delay={delay} className="!p-0">
      <Link
        href={href}
        className="flex items-center gap-4 p-5"
      >
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-apple-ink">{label}</p>
          <p className="mt-0.5 truncate text-[11px] text-apple-ink-muted-48">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-apple-ink-muted-48 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-apple-ink-muted-48" />
      </Link>
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
}: {
  usedMB: number;
  limitMB: number;
  unlimited: boolean;
  percentUsed: number;
  billingHref: string;
  delay: number;
}) {
  const usedLabel = usedMB >= 1024 ? `${(usedMB / 1024).toFixed(2)} GB` : `${usedMB.toFixed(1)} MB`;
  const limitLabel = unlimited ? "Unlimited" : limitMB >= 1024 ? `${(limitMB / 1024).toFixed(0)} GB` : `${limitMB} MB`;
  const remainingMB = unlimited ? 0 : Math.max(0, limitMB - usedMB);
  const remainingLabel = unlimited ? "Unlimited" : remainingMB >= 1024 ? `${(remainingMB / 1024).toFixed(2)} GB` : `${remainingMB.toFixed(1)} MB`;
  const isHigh = !unlimited && percentUsed >= 80;
  const barColor = isHigh ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-indigo-500";

  return (
    <DashboardCard delay={delay}>
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-apple-ink">Storage</h3>
        {isHigh && (
          <Link href={billingHref} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 transition-colors hover:bg-amber-100">
            <Zap className="h-2.5 w-2.5" />
            Upgrade
          </Link>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-apple-ink">{usedLabel}</span>
        <span className="text-sm text-apple-ink-muted-48">/ {limitLabel}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-apple-canvas-parchment">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentUsed, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn("h-full rounded-full", barColor)}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-apple-ink-muted-48">
        <span>{remainingLabel} remaining</span>
        <span className="tabular-nums">{percentUsed}% used</span>
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
}: {
  planName: string;
  features: string[];
  storage: string;
  bandwidth: string;
  billingHref: string;
  delay: number;
}) {
  return (
    <DashboardCard delay={delay}>
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-apple-ink">Current Plan</h3>
        <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
          {planName}
        </span>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-3.5 py-2.5">
          <span className="text-[11px] font-medium text-apple-ink-muted-48">Storage</span>
          <span className="text-[11px] font-semibold text-apple-ink-muted-80">{storage}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-3.5 py-2.5">
          <span className="text-[11px] font-medium text-apple-ink-muted-48">Bandwidth</span>
          <span className="text-[11px] font-semibold text-apple-ink-muted-80">{bandwidth}</span>
        </div>
      </div>
      {features.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Features</p>
          <div className="flex flex-wrap gap-1.5">
            {features.slice(0, 4).map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded-full bg-apple-canvas-parchment px-2 py-0.5 text-[10px] font-medium text-apple-ink-muted-80">
                <Shield className="h-2.5 w-2.5 text-emerald-500" />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
      <Link
        href={billingHref}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-apple-ink px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-apple-ink-muted-80 hover:shadow-lg active:scale-[0.98]"
      >
        <CreditCard className="h-4 w-4" />
        Manage Plan
      </Link>
    </DashboardCard>
  );
}

/* ── Performance Card ─────────────────────────────────────────── */

function PerformanceCard({
  productCount,
  orderCount,
  mediaCount,
  pageViews,
  delay,
}: {
  productCount: number;
  orderCount: number;
  mediaCount: number;
  pageViews: number;
  delay: number;
}) {
  const metrics = [
    { label: "Products", value: productCount, max: 500, color: "from-emerald-500 to-teal-500" },
    { label: "Orders", value: orderCount, max: 1000, color: "from-blue-500 to-indigo-500" },
    { label: "Media Files", value: mediaCount, max: 200, color: "from-violet-500 to-purple-500" },
    { label: "Page Views", value: pageViews, max: 10000, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <DashboardCard delay={delay}>
      <h3 className="text-[13px] font-semibold text-apple-ink">Store Health</h3>
      <div className="mt-4 space-y-3.5">
        {metrics.map((m) => {
          const pct = Math.min(100, Math.round((m.value / m.max) * 100));
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-apple-ink-muted-80">{m.label}</span>
                <span className="tabular-nums text-apple-ink-muted-48">{formatCompact(m.value)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-apple-canvas-parchment">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={cn("h-full rounded-full bg-gradient-to-r", m.color)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}

/* ── Activity Timeline ────────────────────────────────────────── */

function ActivityTimeline({
  store,
  delay,
}: {
  store: Store;
  delay: number;
}) {
  const items = [
    {
      icon: Package,
      color: "bg-emerald-100 text-emerald-600",
      label: "Store created",
      time: new Date(store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      icon: Clock,
      color: "bg-blue-100 text-blue-600",
      label: "Last updated",
      time: new Date(store.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    },
    {
      icon: ShoppingCart,
      color: "bg-amber-100 text-amber-600",
      label: `${store.orderCount ?? 0} orders`,
      time: "All time",
    },
    {
      icon: DollarSign,
      color: "bg-violet-100 text-violet-600",
      label: `${formatBDT(store.revenueBDT ?? 0)} revenue`,
      time: "All time",
    },
  ];

  return (
    <DashboardCard delay={delay}>
      <h3 className="text-[13px] font-semibold text-apple-ink">Activity</h3>
      <div className="mt-4 space-y-3.5">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", item.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-apple-ink">{item.label}</p>
                <p className="text-[11px] text-apple-ink-muted-48">{item.time}</p>
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
}: {
  store: Store;
  planName: string;
  delay: number;
}) {
  return (
    <DashboardCard delay={delay}>
      <h3 className="text-[13px] font-semibold text-apple-ink">Store Details</h3>
      <div className="mt-4 space-y-2.5">
        {[
          { label: "Name", value: store.name },
          { label: "Category", value: store.category || "—" },
          { label: "Subdomain", value: getStoreDisplayDomain(store.subdomain || store.slug) },
          { label: "Plan", value: planName || "Free" },
          { label: "Created", value: new Date(store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-xl bg-apple-canvas-parchment px-3.5 py-2.5">
            <span className="text-[11px] font-medium text-apple-ink-muted-48">{item.label}</span>
            <span className="max-w-[60%] truncate text-right text-[11px] font-semibold text-apple-ink-muted-80">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────── */

export function StoreDashboard({ store, storeId }: { store: Store; storeId: string }) {
  const { data: mediaStats } = useGetMediaStatsQuery(storeId);
  const { data: subscriptionData } = useGetStoreSubscriptionQuery(storeId);
  const { data: accessData } = useGetStoreFeatureAccessQuery(storeId);

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

  return (
    <div className="space-y-6">
      {/* ── Store Header ─────────────────────────────────────── */}
      <DashboardCard delay={0} className="!p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-zinc-50 via-white to-zinc-50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-apple-ink">{store.shortName || store.name}</h1>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
                  status === "active" ? "bg-emerald-50 text-emerald-700" :
                  status === "trial" ? "bg-blue-50 text-blue-700" :
                  "bg-amber-50 text-amber-700"
                )}>
                  {statusConfig.label}
                </span>
                <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700">
                  {planName}
                </span>
                {status === "trial" && trialDays !== null && (
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                    {trialDays}d trial left
                  </span>
                )}
              </div>
              <p className="mt-2 text-[13px] text-apple-ink-muted-48">{store.tagline || store.description || store.slug}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`${storeBase}/settings`}
                className="inline-flex items-center gap-2 rounded-xl border border-apple-hairline bg-white px-4 py-2.5 text-[13px] font-medium text-apple-ink-muted-80 transition-all duration-200 hover:border-zinc-300 hover:bg-apple-canvas-parchment hover: active:scale-[0.98]"
              >
                Edit Store
              </Link>
              <a
                href={getStoreUrl(store.subdomain || store.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-apple-hairline bg-white px-4 py-2.5 text-[13px] font-medium text-apple-ink-muted-80 transition-all duration-200 hover:border-zinc-300 hover:bg-apple-canvas-parchment hover: active:scale-[0.98]"
              >
                <Globe className="h-4 w-4" />
                Visit Store
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link
                href={`${storeBase}/builder`}
                className="inline-flex items-center gap-2 rounded-xl border border-apple-hairline bg-white px-4 py-2.5 text-[13px] font-medium text-apple-ink-muted-80 transition-all duration-200 hover:border-zinc-300 hover:bg-apple-canvas-parchment hover: active:scale-[0.98]"
              >
                <Palette className="h-4 w-4" />
                Builder
              </Link>
              <Link
                href={billingHref}
                className="inline-flex items-center gap-2 rounded-xl bg-apple-ink px-4 py-2.5 text-[13px] font-medium text-white transition-all duration-200 hover:bg-apple-ink-muted-80 hover:shadow-lg active:scale-[0.98]"
              >
                <CreditCard className="h-4 w-4" />
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={store.productCount ?? 0}
          icon={Package}
          color="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.05}
        />
        <StatCard
          label="Total Orders"
          value={store.orderCount ?? 0}
          icon={ShoppingCart}
          color="text-amber-600"
          bg="bg-amber-50"
          delay={0.1}
        />
        <StatCard
          label="Revenue"
          value={formatBDT(store.revenueBDT ?? 0)}
          icon={DollarSign}
          color="text-violet-600"
          bg="bg-violet-50"
          delay={0.15}
        />
        <StatCard
          label="Customers"
          value={usage?.customers ?? 0}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
          delay={0.2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Conversion Rate"
          value={conversionRate}
          icon={TrendingUp}
          color="text-emerald-600"
          bg="bg-emerald-50"
          delay={0.25}
        />
        <StatCard
          label="Reviews"
          value={usage?.reviews ?? 0}
          icon={Eye}
          color="text-rose-600"
          bg="bg-rose-50"
          delay={0.3}
        />
        <StatCard
          label="Coupons"
          value={usage?.coupons ?? 0}
          icon={Ticket}
          color="text-indigo-600"
          bg="bg-indigo-50"
          delay={0.35}
        />
      </div>

      {/* ── Storage + Plan + Performance ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <StorageCard
          usedMB={stats?.usedMB ?? 0}
          limitMB={stats?.limitMB ?? 0}
          unlimited={stats?.unlimited ?? false}
          percentUsed={stats?.percentUsed ?? 0}
          billingHref={billingHref}
          delay={0.4}
        />
        <PlanCard
          planName={planName || "Free"}
          features={features.filter((f) => f.enabled && !f.comingSoon).map((f) => f.name).slice(0, 6)}
          storage={usage?.storageLimitFormatted ?? "—"}
          bandwidth="—"
          billingHref={billingHref}
          delay={0.45}
        />
        <PerformanceCard
          productCount={store.productCount ?? 0}
          orderCount={store.orderCount ?? 0}
          mediaCount={usage?.media ?? 0}
          pageViews={0}
          delay={0.5}
        />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-[13px] font-semibold text-apple-ink">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            label="Create Product"
            description="Add a new product to your store"
            icon={Plus}
            href={`${storeBase}/products/new`}
            color="text-emerald-600"
            bg="bg-emerald-50"
            delay={0.55}
          />
          <QuickActionCard
            label="Open Builder"
            description="Design your storefront pages"
            icon={Palette}
            href={`${storeBase}/builder`}
            color="text-violet-600"
            bg="bg-violet-50"
            delay={0.58}
          />
          <QuickActionCard
            label="Media Library"
            description="Manage images and files"
            icon={Image}
            href={`${storeBase}/media`}
            color="text-blue-600"
            bg="bg-blue-50"
            delay={0.61}
          />
          <QuickActionCard
            label="Categories"
            description="Organize your products"
            icon={Tags}
            href={`${storeBase}/categories`}
            color="text-amber-600"
            bg="bg-amber-50"
            delay={0.64}
          />
          <QuickActionCard
            label="Coupons"
            description="Create discount codes"
            icon={Ticket}
            href={`${storeBase}/coupons`}
            color="text-rose-600"
            bg="bg-rose-50"
            delay={0.67}
          />
          <QuickActionCard
            label="Orders"
            description="View and manage orders"
            icon={ShoppingCart}
            href={`${storeBase}/orders`}
            color="text-indigo-600"
            bg="bg-indigo-50"
            delay={0.7}
          />
          <QuickActionCard
            label="Analytics"
            description="Track store performance"
            icon={BarChart3}
            href={`${storeBase}/analytics`}
            color="text-cyan-600"
            bg="bg-cyan-50"
            delay={0.73}
          />
          <QuickActionCard
            label="Theme"
            description="Colors, fonts & branding"
            icon={Palette}
            href={`${storeBase}/theme`}
            color="text-apple-ink-muted-80"
            bg="bg-apple-canvas-parchment"
            delay={0.76}
          />
        </div>
      </div>

      {/* ── Activity + Details ────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityTimeline store={store} delay={0.79} />
        <StoreDetailsCard store={store} planName={planName || "Free"} delay={0.82} />
      </div>
    </div>
  );
}
