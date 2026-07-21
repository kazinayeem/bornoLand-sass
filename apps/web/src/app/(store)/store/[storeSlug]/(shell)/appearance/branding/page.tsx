"use client";

import { Loader2 } from "lucide-react";
import { BrandingTab } from "@/components/workspace/branding-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";

export default function StoreBrandingPage() {
  const { storeId, store, isLoading } = useStorePage();
  if (isLoading || !storeId || !store) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }
  return <StorePageCard><BrandingTab storeId={storeId} storeSlug={store.slug} /></StorePageCard>;
}
