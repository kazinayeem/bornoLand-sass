"use client";

import { useParams } from "next/navigation";
import { StorePageCard, useStorePage } from "@/components/store-dashboard/store-page";
import { StoreTrackingSettingsComponent } from "@/components/tracking/store-tracking-settings";

export default function StoreTrackingSettingsPage() {
  const params = useParams<{ storeSlug: string }>();
  const storeSlug = params?.storeSlug ?? "";
  const { store } = useStorePage();
  const storeId = store?._id ? String(store._id) : "";

  if (!storeId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <StoreTrackingSettingsComponent storeId={storeId} storeSlug={storeSlug} />
    </div>
  );
}
