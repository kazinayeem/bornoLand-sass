"use client";

import { PaymentsTab } from "@/components/workspace/payments-tab";
import { DeliveryTab } from "@/components/workspace/delivery-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreBillingPage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }
  return (
    <div className="space-y-6">
      <StorePageCard>
        <h2 className="text-lg font-semibold text-zinc-900">Subscription</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage your store plan and payment methods.</p>
        <div className="mt-6">
          <PaymentsTab storeId={storeId} />
        </div>
      </StorePageCard>
      <StorePageCard>
        <h2 className="text-lg font-semibold text-zinc-900">Delivery</h2>
        <div className="mt-4">
          <DeliveryTab storeId={storeId} />
        </div>
      </StorePageCard>
    </div>
  );
}
