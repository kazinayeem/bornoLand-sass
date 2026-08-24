"use client";

import { IncompleteOrdersTab } from "@/components/orders/incomplete-orders-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
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
    <div className="space-y-6">
      <StorePageHeader
        title="Incomplete Orders"
        description="Track and recover abandoned checkout sessions when customers enter their details but do not complete order placement."
        breadcrumbs={[
          { label: "Dashboard", href: `/store/${store?.slug}/dashboard` },
          { label: "Sales" },
          { label: "Incomplete Orders" },
        ]}
      />
      <StorePageCard>
        <IncompleteOrdersTab storeId={storeId} storeSlug={store?.slug} />
      </StorePageCard>
    </div>
  );
}
