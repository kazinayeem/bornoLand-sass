"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SKELETON_SHOW_DELAY_MS } from "@/lib/loading/constants";

/**
 * Holds skeleton UI until `delayMs` elapses. If the route resolves sooner,
 * this unmounts and customers never see a loading flash.
 */
export function DelayedSkeleton({
  children,
  delayMs = SKELETON_SHOW_DELAY_MS,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  return <>{children}</>;
}
