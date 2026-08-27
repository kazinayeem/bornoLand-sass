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
import { useLanguage } from "@/providers/language-provider";

export default function WorkspaceDashboardPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { data, isLoading, refetch } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];
  const isBn = language === "bn";

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
        description: isBn ? "দোকান আপডেট করা হয়েছে" : "Store updated",
        time: new Date(store.updatedAt).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric" }),
        meta: formatBDT(store.revenueBDT ?? 0),
      })),
    [recentStores, isBn]
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
        title={isBn ? "ওয়ার্কস্পেস ড্যাশবোর্ড" : "Workspace Dashboard"}
        description={isBn ? "আপনার সব অনলাইন দোকান, মোট বিক্রয়, অর্ডার ও ব্যবসায়িক গতিবিধি এক নজরে দেখুন।" : "Overview of all your online stores, total sales, orders, and business activity."}
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <RefreshCw className="h-4 w-4" />
              {t.common.refresh}
            </button>
            <Link
              href="/dashboard/stores/create"
              className="inline-flex items-center gap-2 rounded-xl bg-apple-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              {t.navigation.createStore}
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="সক্রিয় দোকান" value={metrics.active} icon={Store} iconClassName="text-emerald-600" />
        <StatCard label="ট্রায়াল দোকান" value={metrics.trial} icon={Clock} iconClassName="text-blue-600" />
        <StatCard
          label="অপেক্ষমাণ দোকান"
          value={metrics.pendingApproval}
          icon={Store}
          iconClassName="text-violet-600"
        />
        <StatCard label="মেয়াদ শেষ দোকান" value={metrics.expired} icon={Store} iconClassName="text-red-600" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="মোট বিক্রয়" value={formatBDT(metrics.revenue)} icon={CreditCard} />
        <StatCard label="মোট অর্ডার" value={metrics.orders} icon={ShoppingBag} />
        <StatCard label="স্টোরেজ ব্যবহার" value="—" icon={HardDrive} trend="প্রস্তুত হচ্ছে" />
        <StatCard
          label="সাবস্ক্রিপশন স্ট্যাটাস"
          value={stores.length > 0 ? `${metrics.active + metrics.trial}টি সক্রিয়` : "কোনো দোকান নেই"}
          icon={CreditCard}
        />
      </div>

      {/* Visitor Analytics Section */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-apple-ink-muted-80">ভিজিটর অ্যানালিটিক্স</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "আজকের ভিজিটর", value: String(visitorStats?.today ?? 0), icon: Activity, color: "blue", href: "/dashboard/analytics" },
            { label: "এই সপ্তাহে", value: String(visitorStats?.week ?? 0), icon: TrendingUp, color: "emerald", href: "/dashboard/analytics" },
            { label: "এই মাসে", value: String(visitorStats?.month ?? 0), icon: Eye, color: "purple", href: "/dashboard/analytics" },
            { label: "লাইভ ভিজিটর", value: String(visitorStats?.liveVisitors ?? 0), icon: Activity, color: "emerald", href: "/dashboard/analytics" },
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
            <CardTitle>সাম্প্রতিক দোকানসমূহ</CardTitle>
            <CardDescription>আপনার সম্প্রতি আপডেট হওয়া অনলাইন দোকানসমূহ।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentStores.length === 0 ? (
              <p className="py-8 text-center text-sm text-apple-ink-muted-48">এখনও কোনো দোকান তৈরি করা হয়নি। শুরু করতে আপনার প্রথম দোকানটি তৈরি করুন।</p>
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
            <CardTitle>সাম্প্রতিক কার্যক্রম</CardTitle>
            <CardDescription>ওয়ার্কস্পেসের সাম্প্রতিক আপডেটসমূহ।</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-apple-ink-muted-48">এখনও কোনো কার্যক্রম রেকর্ড হয়নি।</p>
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
          <CardTitle>দ্রুত কাজ</CardTitle>
          <CardDescription>আপনার ব্যবসার প্রয়োজনীয় কাজগুলো দ্রুত সম্পন্ন করুন।</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "দোকান তৈরি করুন", href: "/dashboard/stores/create", icon: Plus },
              { label: "বিলিং ও প্ল্যান", href: "/dashboard/billing", icon: CreditCard },
              { label: "টিম সদস্য আমন্ত্রণ", href: "/dashboard/team", icon: Users },
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
