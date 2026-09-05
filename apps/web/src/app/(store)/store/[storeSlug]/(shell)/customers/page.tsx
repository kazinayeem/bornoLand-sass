"use client";

import { CustomersTab } from "@/components/workspace/customers-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreCustomersPage() {
  const { storeId, store, isLoading } = useStorePage();
  return (
    <div className="space-y-6">
      <StorePageHeader
        title="Customers"
        description="View and manage customer profiles, total spend, purchase orders, and contact details."
        breadcrumbs={[
          { label: "Dashboard", href: store ? `/store/${store.slug}/dashboard` : "#" },
          { label: "Customers" },
        ]}
      />
      <StorePageCard>
        {isLoading || !storeId ? (
          <TablePageSkeleton rows={6} cols={6} />
        ) : (
          <CustomersTab storeId={storeId} />
        )}
      </StorePageCard>
    </div>
  );
}
