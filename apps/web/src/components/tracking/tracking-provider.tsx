"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackingManager } from "@/lib/tracking/tracking-manager";
import type {
  PublicStoreTracking,
  StandardEventName,
  TrackingPayload,
  TrackingUserData,
} from "@/lib/tracking/types";

type TrackingContextType = {
  track: (eventName: StandardEventName, payload?: TrackingPayload, eventId?: string) => void;
  setUser: (userData: TrackingUserData) => void;
  storeId: string;
  tracking: PublicStoreTracking | null;
  builderMode: boolean;
};

const TrackingContext = createContext<TrackingContextType | null>(null);

export function useTracking(): TrackingContextType {
  const ctx = useContext(TrackingContext);
  if (!ctx) {
    return {
      track: (eventName, payload, eventId) => trackingManager.track(eventName, payload, eventId),
      setUser: (userData) => trackingManager.setUserData(userData),
      storeId: "",
      tracking: null,
      builderMode: false,
    };
  }
  return ctx;
}

export type TrackingProviderProps = {
  storeId: string;
  tracking?: PublicStoreTracking | null;
  builderMode?: boolean;
  userData?: TrackingUserData;
  children?: ReactNode;
};

export function TrackingProvider({
  storeId,
  tracking = null,
  builderMode = false,
  userData,
  children,
}: TrackingProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitializedRef = useRef(false);
  const lastTrackedPathRef = useRef<string | null>(null);

  // Initialize tracking manager on mount or when storeId / tracking config changes
  useEffect(() => {
    if (!storeId) return;

    trackingManager.init(storeId, tracking, builderMode, userData);
    isInitializedRef.current = true;
  }, [storeId, tracking, builderMode, userData]);

  // Track PageView on route navigation and initial mount
  useEffect(() => {
    if (builderMode || !isInitializedRef.current) return;

    const currentPath = `${pathname || ""}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    if (lastTrackedPathRef.current === currentPath) return;
    lastTrackedPathRef.current = currentPath;

    trackingManager.track("PageView", {
      page_path: pathname || "/",
      search_params: searchParams?.toString() || "",
    });
  }, [pathname, searchParams, builderMode]);

  const contextValue = useMemo<TrackingContextType>(
    () => ({
      track: (eventName, payload, eventId) => trackingManager.track(eventName, payload, eventId),
      setUser: (data) => trackingManager.setUserData(data),
      storeId,
      tracking: tracking || null,
      builderMode,
    }),
    [storeId, tracking, builderMode]
  );

  const metaPixelId = tracking?.metaPixel?.enabled && tracking.metaPixel.pixelId ? tracking.metaPixel.pixelId.trim() : "";

  return (
    <TrackingContext.Provider value={contextValue}>
      {/* Meta Pixel NoScript Fallback */}
      {metaPixelId && !builderMode ? (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${encodeURIComponent(metaPixelId)}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      ) : null}
      {children}
    </TrackingContext.Provider>
  );
}
