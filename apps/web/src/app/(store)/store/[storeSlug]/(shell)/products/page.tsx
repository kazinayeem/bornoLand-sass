"use client";

import { Suspense } from "react";
import { ProductsTab } from "@/components/workspace/products-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { TablePageSkeleton } from "@/components/loading/table-page-skeleton";

function StoreProductsContent() {
  const { storeId, store, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <TablePageSkeleton rows={7} cols={6} />;
  }
  const billingHref = store ? `/store/${store.slug}/billing` : "#";
  return (
    <div className="space-y-6">
      <StorePageCard>
        <ProductsTab storeId={storeId} storeSlug={store?.slug} billingHref={billingHref} />
      </StorePageCard>
    </div>
  );
}

export default function StoreProductsPage() {
  return (
    <Suspense fallback={<TablePageSkeleton rows={7} cols={6} />}>
      <StoreProductsContent />
    </Suspense>
  );
}
