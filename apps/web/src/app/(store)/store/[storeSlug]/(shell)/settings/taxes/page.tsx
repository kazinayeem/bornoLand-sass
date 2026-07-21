"use client";

import { SettingsTab } from "@/components/workspace/settings-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

/** Taxes currently live on general settings (tax rate / included). */
export default function StoreTaxesSettingsPage() {
  const { storeId, isLoading } = useStorePage();
  if (isLoading || !storeId) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }
  return (
    <StorePageCard>
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-apple-ink">Taxes</h2>
        <p className="mb-4 text-[12px] text-apple-ink-muted-48">
          Tax rate and tax-included pricing are managed with your store currency settings.
        </p>
      </div>
      <SettingsTab storeId={storeId} />
    </StorePageCard>
  );
}
