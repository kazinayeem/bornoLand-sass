"use client";

import { PaymentsTab } from "@/components/workspace/payments-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StorePaymentsSettingsPage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }
  return (
    <StorePageCard>
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-apple-ink">Payment methods</h2>
        <p className="text-[12px] text-apple-ink-muted-48">
          Enable COD, mobile banking, bank transfer, and gateways shown at checkout.
        </p>
      </div>
      <PaymentsTab storeId={storeId} />
    </StorePageCard>
  );
}
