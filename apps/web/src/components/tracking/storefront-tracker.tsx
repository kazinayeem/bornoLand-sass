"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackingManager } from "@/lib/tracking/tracking-manager";
import type { PublicStoreTracking } from "@/lib/tracking/types";

type Props = {
  storeId: string;
  tracking?: PublicStoreTracking | null;
  builderMode?: boolean;
};

export function StorefrontTracker({ storeId, tracking, builderMode = false }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!storeId) return;

    if (!isInitializedRef.current) {
      trackingManager.init(storeId, tracking, builderMode);
      isInitializedRef.current = true;
    }
  }, [storeId, tracking, builderMode]);

  // Track PageView on path / search parameter changes
  useEffect(() => {
    if (builderMode || !isInitializedRef.current) return;

    // Trigger PageView
    trackingManager.track("PageView", {
      page_path: pathname,
      search_params: searchParams?.toString(),
    });
  }, [pathname, searchParams, builderMode]);

  return null;
}
