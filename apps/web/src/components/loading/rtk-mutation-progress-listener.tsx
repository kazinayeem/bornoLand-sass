"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/hooks/redux";
import { useLoading } from "@/hooks/use-loading";

/**
 * Shows the top navigation progress bar during RTK Query mutations
 * (not background refetches).
 */
export function RtkMutationProgressListener() {
  const { startNavigation, completeNavigation } = useLoading();
  const mutations = useAppSelector((state) => state.baseApi.mutations);
  const pendingCount = Object.values(mutations).filter((m) => m?.status === "pending").length;
  const prevCountRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (pendingCount > 0 && prevCountRef.current === 0) {
      startedRef.current = true;
      startNavigation();
    } else if (pendingCount === 0 && startedRef.current) {
      startedRef.current = false;
      completeNavigation();
    }
    prevCountRef.current = pendingCount;
  }, [pendingCount, startNavigation, completeNavigation]);

  return null;
}
