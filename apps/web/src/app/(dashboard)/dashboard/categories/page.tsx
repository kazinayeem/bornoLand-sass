"use client";

import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

export default function LegacyCategoriesPage() {
  return (
    <LegacyStoreRouteRedirect
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/categories`}
    />
  );
}
