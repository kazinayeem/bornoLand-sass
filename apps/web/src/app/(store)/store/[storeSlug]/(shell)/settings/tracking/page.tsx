"use client";

import { useParams } from "next/navigation";
import { useStorePage } from "@/components/store-dashboard/store-page";
import { StoreTrackingSettingsComponent } from "@/components/tracking/store-tracking-settings";
import { StorePageHeader } from "@/components/store-dashboard/store-page-header";

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
      <StorePageHeader
        title="Tracking & Pixels"
        description="Connect Meta (Facebook) Pixel, TikTok Pixel, and server-side Conversions API to track storefront events."
        breadcrumbs={[
          { label: "Dashboard", href: `/store/${storeSlug}/dashboard` },
          { label: "Growth" },
          { label: "Tracking & Pixels" },
        ]}
      />
      <StoreTrackingSettingsComponent storeId={storeId} storeSlug={storeSlug} />
    </div>
  );
}
