"use client";

import { OrdersTab } from "@/components/workspace/orders-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { Loader2 } from "lucide-react";

export default function StoreOrdersPage() {
  const { storeId, store, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }
  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Orders"
        description="View and manage store customer orders, shipments, and processing states."
        breadcrumbs={[
          { label: "Dashboard", href: `/store/${store?.slug}/dashboard` },
          { label: "Sales" },
          { label: "Orders" },
        ]}
      />
      <StorePageCard><OrdersTab storeId={storeId} /></StorePageCard>
    </div>
  );
}
