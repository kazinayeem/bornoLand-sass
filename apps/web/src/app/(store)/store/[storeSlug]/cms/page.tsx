"use client";

import { CmsTab } from "@/components/workspace/cms-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreCmsPage() {
  const { store, storeId, isLoading } = useStorePage();
  if (isLoading || !storeId || !store) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }
  return <StorePageCard><CmsTab storeId={storeId} storeSlug={store.slug} /></StorePageCard>;
}
