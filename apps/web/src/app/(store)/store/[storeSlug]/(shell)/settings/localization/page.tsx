"use client";

import { SettingsTab } from "@/components/workspace/settings-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function StoreLocalizationSettingsPage() {
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
        <h2 className="text-[15px] font-semibold text-apple-ink">Localization</h2>
        <p className="mb-4 text-[12px] text-apple-ink-muted-48">
          Currency, locale, language, timezone, and date format.
        </p>
      </div>
      <SettingsTab storeId={storeId} />
    </StorePageCard>
  );
}
