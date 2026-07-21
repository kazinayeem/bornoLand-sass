"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { useLoading } from "@/hooks/use-loading";
import {
  BUILDER_MUTATION_PROGRESS_DELAY_MS,
  BUILDER_SILENT_MUTATION_ENDPOINTS,
  BUILDER_TOP_BAR_MUTATION_ENDPOINTS,
  isBuilderRoute,
} from "@/lib/loading/builder-progress";

/**
 * Shows the top navigation progress bar during RTK Query mutations.
 * Inside the Builder, suppresses autosave / micro-edits and only surfaces
 * publish (and similar) or mutations that stay pending >500ms.
 */
export function RtkMutationProgressListener() {
  const pathname = usePathname() || "";
  const { startNavigation, completeNavigation } = useLoading();
  const mutations = useAppSelector((state) => state.baseApi.mutations);
  const startedRef = useRef(false);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inBuilder = isBuilderRoute(pathname);

  const { mode, key } = useMemo(() => {
    const pending = Object.values(mutations).filter((m) => m?.status === "pending");
    const names = pending
      .map((m) => (m as { endpointName?: string } | undefined)?.endpointName ?? "")
      .filter(Boolean);

    if (!inBuilder) {
      return {
        mode: pending.length > 0 ? ("immediate" as const) : ("idle" as const),
        key: names.slice().sort().join("|"),
      };
    }

    const nonSilent = names.filter((n) => !BUILDER_SILENT_MUTATION_ENDPOINTS.has(n));
    if (nonSilent.length === 0) {
      return { mode: "idle" as const, key: "" };
    }
    if (nonSilent.some((n) => BUILDER_TOP_BAR_MUTATION_ENDPOINTS.has(n))) {
      return {
        mode: "immediate" as const,
        key: nonSilent.slice().sort().join("|"),
      };
    }
    return {
      mode: "delayed" as const,
      key: nonSilent.slice().sort().join("|"),
    };
  }, [mutations, inBuilder]);

  useEffect(() => {
    const clearDelay = () => {
      if (delayTimerRef.current) {
        clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };

    const stop = () => {
      clearDelay();
      if (startedRef.current) {
        startedRef.current = false;
        completeNavigation();
      }
    };

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      startNavigation();
    };

    if (mode === "idle") {
      stop();
      return;
    }

    if (mode === "immediate") {
      clearDelay();
      start();
      return;
    }

    // delayed — long-running Builder mutation
    if (!startedRef.current && !delayTimerRef.current) {
      delayTimerRef.current = setTimeout(() => {
        delayTimerRef.current = null;
        start();
      }, BUILDER_MUTATION_PROGRESS_DELAY_MS);
    }

    return clearDelay;
  }, [mode, key, startNavigation, completeNavigation]);

  return null;
}
