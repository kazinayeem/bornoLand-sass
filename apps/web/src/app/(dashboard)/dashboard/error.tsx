"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, Sparkles } from "lucide-react";
import { isChunkLoadError, attemptChunkReload, triggerHardReload } from "@/lib/chunk-error-recovery";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    console.error("[DashboardError]", error);
    if (isChunkLoadError(error)) {
      setIsChunkError(true);
      attemptChunkReload();
    }
  }, [error]);

  if (isChunkError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <Sparkles className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Dashboard Update Available
        </h2>
        <p className="mt-1.5 text-xs text-zinc-500 max-w-md dark:text-zinc-400">
          A new version of BornoLand has been deployed. Please reload the page to load the latest dashboard components.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => triggerHardReload()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Application
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Home className="h-3.5 w-3.5" />
            Platform Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="mt-1.5 text-xs text-zinc-500 max-w-md dark:text-zinc-400">
        {error.message || "An unexpected error occurred. Please try again or return to your workspace."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-950"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </button>
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <Home className="h-3.5 w-3.5" />
          Merchant Workspace
        </Link>
      </div>
    </div>
  );
}
