"use client";

import { OverviewTab } from "@/components/workspace/overview-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreDashboardPage() {
  const { store, storeId, isLoading } = useStorePage();

  if (isLoading || !store || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <StorePageCard>
      <OverviewTab storeId={storeId} store={store} />
    </StorePageCard>
  );
}
