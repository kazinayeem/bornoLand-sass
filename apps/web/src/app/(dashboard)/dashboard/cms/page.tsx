"use client";

import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

export default function LegacyCmsPage() {
  return (
    <LegacyStoreRouteRedirect
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/cms`}
    />
  );
}
