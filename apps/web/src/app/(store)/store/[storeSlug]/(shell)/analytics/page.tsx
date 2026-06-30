"use client";

import { AnalyticsTab } from "@/components/workspace/analytics-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreAnalyticsPage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-zinc-400" /></div>;
  }
  return <StorePageCard><AnalyticsTab storeId={storeId} /></StorePageCard>;
}
