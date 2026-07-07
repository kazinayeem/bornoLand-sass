"use client";

import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/workspace/page-header";
import { UsageMeters } from "@/components/dashboard/subscription/usage-meters";
import { useGetStoreDashboardStatsQuery } from "@/redux/api/subscription-api";
import { useGetStoreQuery } from "@/redux/api/store-api";

export default function SubscriptionPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const { data: storeData } = useGetStoreQuery(storeId);
  const { data: statsData, isLoading } = useGetStoreDashboardStatsQuery(storeId, {
    skip: !storeId,
  });

  const store = storeData?.data?.store;
  const stats = statsData?.data;

  if (isLoading || !store) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription & Usage"
        description={`Manage your ${store.name} subscription and monitor resource usage`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Plan Details</h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">Plan</p>
                <p className="mt-0.5 text-base font-bold text-zinc-900">{stats?.plan?.name ?? "—"}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">Status</p>
                <p className="mt-0.5 text-base font-bold text-zinc-900 capitalize">{store.subscriptionStatus}</p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">Billing</p>
                <p className="mt-0.5 text-base font-bold text-zinc-900 capitalize">{store.billingStatus}</p>
              </div>
            </div>

            {stats?.plan && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-zinc-700">Feature Access</h4>
                <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {Object.entries(stats.plan.featureToggles)
                    .filter(([, v]) => v)
                    .slice(0, 24)
                    .map(([key]) => (
                      <div key={key} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          {stats && (
            <UsageMeters
              usage={stats.usage}
              storage={stats.storage}
              planName={stats.plan?.name ?? store.plan}
              trialEndsAt={store.trialEndsAt}
            />
          )}
        </div>
      </div>
    </div>
  );
}
