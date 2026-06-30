"use client";

import { useParams } from "next/navigation";
import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

export default function LegacyStoreProductsPage() {
  const params = useParams();
  const storeId = typeof params.storeId === "string" ? params.storeId : "";

  return (
    <LegacyStoreRouteRedirect
      storeId={storeId}
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/products`}
    />
  );
}
