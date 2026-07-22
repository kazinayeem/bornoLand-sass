"use client";

import { StoreContactTab } from "@/components/cms/store-contact-tab";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { Loader2 } from "lucide-react";

export default function SettingsContactPage() {
  const { storeId, store, isLoading } = useStorePage();

  if (isLoading || !storeId || !store) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <StorePageCard>
      <StoreContactTab storeId={storeId} storeSlug={store.slug} />
    </StorePageCard>
  );
}
