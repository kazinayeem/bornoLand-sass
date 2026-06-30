"use client";

import { PaymentsTab } from "@/components/workspace/payments-tab";
import { DeliveryTab } from "@/components/workspace/delivery-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StoreSubscriptionBilling } from "@/components/store-dashboard/store-subscription-billing";
import { StorageUsageBar } from "@/components/media/storage-usage-bar";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { Loader2 } from "lucide-react";

export default function StoreBillingPage() {
  const { store, storeId, isLoading } = useStorePage();
  const { data: mediaStats } = useGetMediaStatsQuery(storeId ?? "", { skip: !storeId });
  const billingHref = store ? `/store/${store.slug}/billing` : "#";
  if (isLoading || !storeId || !store) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StorePageCard>
        <h2 className="text-lg font-semibold text-zinc-900">Storage</h2>
        <p className="mt-1 text-sm text-zinc-500">Media library usage for this store.</p>
        <div className="mt-4">
          <StorageUsageBar stats={mediaStats?.data?.stats} billingHref={billingHref} />
        </div>
      </StorePageCard>
      <StoreSubscriptionBilling store={store} />
      <StorePageCard>
        <h2 className="text-lg font-semibold text-zinc-900">Storefront Payment Methods</h2>
        <p className="mt-1 text-sm text-zinc-500">Checkout payment options for your customers.</p>
        <div className="mt-4">
          <PaymentsTab storeId={storeId} />
        </div>
      </StorePageCard>
      <StorePageCard>
        <h2 className="text-lg font-semibold text-zinc-900">Delivery Zones</h2>
        <div className="mt-4">
          <DeliveryTab storeId={storeId} />
        </div>
      </StorePageCard>
    </div>
  );
}
