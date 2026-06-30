"use client";

import { useMemo } from "react";
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
} from "lucide-react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { PageHeader } from "@/components/workspace/page-header";
import { StatCard } from "@/components/workspace/stat-card";
import { Badge } from "@/components/ui/badge";
import { formatBDT, resolveStoreStatus, storeStatusConfig } from "@/lib/store-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkspaceDashboardPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

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
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
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
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Stores</CardTitle>
            <CardDescription>Your most recently updated stores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentStores.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">No stores yet. Create your first store to get started.</p>
            ) : (
              recentStores.map((store) => {
                const status = resolveStoreStatus(store);
                const config = storeStatusConfig[status];
                return (
                  <button
                    key={store._id}
                    type="button"
                    onClick={() => router.push(`/store/${store.slug}`)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-4 py-3 text-left transition-all hover:border-zinc-200 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{store.name}</p>
                      <p className="truncate text-xs text-zinc-500">{store.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      <ArrowRight className="h-4 w-4 text-zinc-400" />
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
              <p className="py-8 text-center text-sm text-zinc-500">No activity yet.</p>
            ) : (
              recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-100 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                    <p className="text-xs text-zinc-500">
                      {item.description} · {item.time}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-zinc-900">{item.meta}</span>
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
                <span className="text-sm font-medium text-zinc-900">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
