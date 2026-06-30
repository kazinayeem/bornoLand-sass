"use client";

import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

export default function LegacyThemePage() {
  return (
    <LegacyStoreRouteRedirect
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/appearance/theme`}
    />
  );
}
