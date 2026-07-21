"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Loader2, CreditCard } from "lucide-react";
import { useGetMyStoresQuery, useGetPlansQuery } from "@/redux/api/store-api";
import { PageHeader } from "@/components/workspace/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBDT, resolveStoreStatus, storeStatusConfig } from "@/lib/store-status";

export default function WorkspaceBillingPage() {
  const { data, isLoading } = useGetMyStoresQuery();
  const { data: plansData } = useGetPlansQuery();
  const stores = data?.data?.stores ?? [];
  const plans = plansData?.data?.plans ?? [];

  const summary = useMemo(() => {
    return stores.map((store) => {
      const plan = plans.find((p) => p.slug === store.plan);
      const status = resolveStoreStatus(store);
      return { store, plan, status };
    });
  }, [stores, plans]);

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
        title="Billing"
        description="Subscription overview across all stores in your workspace."
      />

      <Card>
        <CardHeader>
          <CardTitle>Store Subscriptions</CardTitle>
          <CardDescription>Each store has its own plan and billing cycle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.length === 0 ? (
            <p className="py-8 text-center text-sm text-apple-ink-muted-48">No stores yet.</p>
          ) : (
            summary.map(({ store, plan, status }) => {
              const config = storeStatusConfig[status];
              return (
                <div
                  key={store._id}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-apple-canvas-parchment/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-apple-ink">{store.name}</p>
                    <p className="text-sm text-apple-ink-muted-48">
                      {plan?.name ?? store.plan} · {formatBDT(plan?.priceBDT ?? 0)}/mo
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <Link
                      href={`/store/${store.slug}/billing`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      Manage
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
