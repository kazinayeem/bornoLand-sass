"use client";

import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { ProductEditor } from "@/components/products/product-editor";
import { useStorePage } from "@/components/store-dashboard/store-page";

export default function DuplicateProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  const { store, storeId, isLoading } = useStorePage();

  if (isLoading || !storeId || !store) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <ProductEditor
      mode="duplicate"
      storeId={storeId}
      storeSlug={store.slug}
      storeName={store.name}
      billingHref={`/store/${store.slug}/billing`}
      productId={productId}
    />
  );
}
