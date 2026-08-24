"use client";

import { IncompleteOrdersTab } from "@/components/orders/incomplete-orders-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreIncompleteOrdersPage() {
  const { storeId, store, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }
  return (
    <StorePageCard>
      <IncompleteOrdersTab storeId={storeId} storeSlug={store?.slug} />
    </StorePageCard>
  );
}
