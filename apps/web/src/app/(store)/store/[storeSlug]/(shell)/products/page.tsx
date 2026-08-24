"use client";

import { Suspense } from "react";
import { ProductsTab } from "@/components/workspace/products-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

function StoreProductsContent() {
  const { storeId, store, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
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
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
        </div>
      }
    >
      <StoreProductsContent />
    </Suspense>
  );
}
