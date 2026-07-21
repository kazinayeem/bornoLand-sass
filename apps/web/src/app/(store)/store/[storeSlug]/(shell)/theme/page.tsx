"use client";

import { ThemeTab } from "@/components/workspace/theme-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreThemePage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }
  return <StorePageCard><ThemeTab storeId={storeId} /></StorePageCard>;
}
