"use client";

import { OrdersTab } from "@/components/workspace/orders-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreOrdersPage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" /></div>;
  }
  return <StorePageCard><OrdersTab storeId={storeId} /></StorePageCard>;
}
