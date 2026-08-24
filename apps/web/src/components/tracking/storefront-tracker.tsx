"use client";

import { TrackingProvider, type TrackingProviderProps } from "./tracking-provider";

export type StorefrontTrackerProps = TrackingProviderProps;

export function StorefrontTracker(props: StorefrontTrackerProps) {
  return <TrackingProvider {...props} />;
}
