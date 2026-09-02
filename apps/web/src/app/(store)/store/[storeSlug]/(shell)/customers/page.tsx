"use client";

import { CustomersTab } from "@/components/workspace/customers-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreCustomersPage() {
  const { storeId, isLoading } = useStorePage();
  return (
    <StorePageCard>
      {isLoading || !storeId ? (
        <TablePageSkeleton rows={6} cols={5} />
      ) : (
        <CustomersTab storeId={storeId} />
      )}
    </StorePageCard>
  );
}
