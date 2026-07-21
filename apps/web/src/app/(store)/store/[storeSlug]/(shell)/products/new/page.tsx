"use client";

import { Loader2 } from "lucide-react";
import { ProductEditor } from "@/components/products/product-editor";
import { useStorePage } from "@/components/store-dashboard/store-page";

export default function NewProductPage() {
  const { store, storeId, isLoading } = useStorePage();

  if (isLoading || !storeId || !store) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <ProductEditor
      mode="create"
      storeId={storeId}
      storeSlug={store.slug}
      storeName={store.name}
      billingHref={`/store/${store.slug}/billing`}
    />
  );
}
