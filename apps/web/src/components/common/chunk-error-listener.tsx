"use client";

import { useEffect } from "react";
import { isChunkLoadError, attemptChunkReload } from "@/lib/chunk-error-recovery";

/**
 * Global window error & unhandled rejection listener to catch dynamic import / webpack chunk loading failures.
 * Automatically recovers with a controlled page refresh before crashing active user flows.
 */
export function ChunkErrorListener() {
  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError(event.message)) {
        event.preventDefault();
        attemptChunkReload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        attemptChunkReload();
      }
    };

    window.addEventListener("error", handleWindowError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
