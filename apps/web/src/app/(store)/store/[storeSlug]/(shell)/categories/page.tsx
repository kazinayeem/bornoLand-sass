"use client";

import { CategoriesTab } from "@/components/workspace/categories-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

export default function StoreCategoriesPage() {
  const { storeId, isLoading } = useStorePage();
  return (
    <StorePageCard>
      {isLoading || !storeId ? (
        <TablePageSkeleton rows={5} cols={4} />
      ) : (
        <CategoriesTab storeId={storeId} />
      )}
    </StorePageCard>
  );
}
