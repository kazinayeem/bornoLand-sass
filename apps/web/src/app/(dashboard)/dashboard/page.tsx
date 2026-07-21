"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Store,
  ShoppingBag,
  CreditCard,
  HardDrive,
  Clock,
  Plus,
  Users,
  RefreshCw,
  Loader2,
  ArrowRight,
  Eye,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useGetStoreAnalyticsStatsQuery } from "@/redux/api/analytics-api";
import { PageHeader } from "@/components/workspace/page-header";
import { StatCard } from "@/components/workspace/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatBDT, resolveStoreStatus, storeStatusConfig } from "@/lib/store-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function WorkspaceDashboardPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

  const primaryStoreId = stores[0]?._id ?? "";
  const { data: visitorStatsData } = useGetStoreAnalyticsStatsQuery(primaryStoreId, { skip: !primaryStoreId });
  const visitorStats = visitorStatsData?.data as Record<string, unknown> | undefined;

  const metrics = useMemo(() => {
    const counts = {
      active: 0,
      trial: 0,
      pendingApproval: 0,
      expired: 0,
      revenue: 0,
      orders: 0,
    };

    for (const store of stores) {
      const status = resolveStoreStatus(store);
      if (status === "active") counts.active += 1;
      if (status === "trial") counts.trial += 1;
      if (status === "pending_approval") counts.pendingApproval += 1;
      if (status === "expired" || status === "pending_payment") counts.expired += 1;
      counts.revenue += store.revenueBDT ?? 0;
      counts.orders += store.orderCount ?? 0;
    }

    return counts;
  }, [stores]);

  const recentStores = useMemo(
    () => [...stores].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5),
    [stores]
  );

  const recentActivity = useMemo(
    () =>
      recentStores.map((store) => ({
        id: store._id,
        title: store.name,
        description: `Store updated`,
        time: new Date(store.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        meta: formatBDT(store.revenueBDT ?? 0),
      })),
    [recentStores]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspace Dashboard"
        description="Overview of your stores, revenue, and workspace activity."
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              href="/dashboard/stores/create"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Stores" value={metrics.active} icon={Store} iconClassName="text-emerald-600" />
        <StatCard label="Trial Stores" value={metrics.trial} icon={Clock} iconClassName="text-blue-600" />
        <StatCard
          label="Pending Approval"
          value={metrics.pendingApproval}
          icon={Store}
          iconClassName="text-violet-600"
        />
        <StatCard label="Expired Stores" value={metrics.expired} icon={Store} iconClassName="text-red-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatBDT(metrics.revenue)} icon={CreditCard} />
        <StatCard label="Total Orders" value={metrics.orders} icon={ShoppingBag} />
        <StatCard label="Storage Usage" value="—" icon={HardDrive} trend="Coming in Phase 4" />
        <StatCard
          label="Subscription Status"
          value={stores.length > 0 ? `${metrics.active + metrics.trial} active` : "No stores"}
          icon={CreditCard}
        />
      </div>

      {/* Visitor Analytics Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink-muted-80">Visitor Analytics</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Visitors Today", value: String(visitorStats?.today ?? 0), icon: Activity, color: "blue", href: "/dashboard/analytics/visitors" },
            { label: "This Week", value: String(visitorStats?.week ?? 0), icon: TrendingUp, color: "emerald", href: "/dashboard/analytics/visitors" },
            { label: "This Month", value: String(visitorStats?.month ?? 0), icon: Eye, color: "purple", href: "/dashboard/analytics/visitors" },
            { label: "Live Now", value: String(visitorStats?.liveVisitors ?? 0), icon: Activity, color: "emerald", href: "/dashboard/analytics/live" },
          ].map((card, i) => {
            const colorMap: Record<string, string> = {
              blue: "border-blue-100 bg-blue-50 text-blue-700",
              emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
              purple: "border-purple-100 bg-purple-50 text-purple-700",
            };
            return (
              <Link key={card.label} href={card.href}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-colors hover:shadow-sm ${colorMap[card.color] || "border-zinc-100 bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <card.icon className="h-4 w-4" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider opacity-70">{card.label}</p>
                      <p className="text-lg font-bold">{card.value}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Stores</CardTitle>
            <CardDescription>Your most recently updated stores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentStores.length === 0 ? (
              <p className="py-8 text-center text-sm text-apple-ink-muted-48">No stores yet. Create your first store to get started.</p>
            ) : (
              recentStores.map((store) => {
                const status = resolveStoreStatus(store);
                const config = storeStatusConfig[status];
                return (
                  <button
                    key={store._id}
                    type="button"
                    onClick={() => router.push(`/store/${store.slug}`)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-apple-canvas-parchment/80 px-4 py-3 text-left transition-all hover:border-zinc-200 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-apple-ink">{store.name}</p>
                      <p className="truncate text-xs text-apple-ink-muted-48">{store.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      <ArrowRight className="h-4 w-4 text-apple-ink-muted-48" />
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest workspace events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-apple-ink-muted-48">No activity yet.</p>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-apple-ink">{item.title}</p>
                    <p className="text-xs text-apple-ink-muted-48">
                      {item.description} · {item.time}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-apple-ink">{item.meta}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common workspace tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Create Store", href: "/dashboard/stores/create", icon: Plus },
              { label: "Manage Billing", href: "/dashboard/billing", icon: CreditCard },
              { label: "Invite Team", href: "/dashboard/team", icon: Users },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-4 transition-all hover:border-zinc-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-apple-ink">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
