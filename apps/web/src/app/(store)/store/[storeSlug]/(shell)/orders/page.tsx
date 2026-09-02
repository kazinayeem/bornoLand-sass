"use client";

import { OrdersTab } from "@/components/workspace/orders-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreOrdersPage() {
  const { storeId, store, isLoading } = useStorePage();

  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Orders"
        description="View and manage store customer orders, shipments, and processing states."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Sales" },
          { label: "Orders" },
        ]}
      />
      <StorePageCard>
        {isLoading || !storeId ? (
          <TablePageSkeleton rows={6} cols={6} />
        ) : (
          <OrdersTab storeId={storeId} />
        )}
      </StorePageCard>
    </div>
  );
}
