"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, RefreshCw, LayoutDashboard, Store } from "lucide-react";

export default function StoreShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const storeSlug = typeof params.storeSlug === "string" ? params.storeSlug : "";

  useEffect(() => {
    console.error("[StoreShellError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Error loading store page
      </h2>
      <p className="mt-1.5 text-xs text-zinc-500 max-w-md">
        {error.message || "An unexpected error occurred while loading this section. Please try again or return to the store overview."}
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
        {storeSlug && (
          <Link
            href={`/store/${storeSlug}/dashboard`}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Store Dashboard
          </Link>
        )}
        <Link
          href="/workshops"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
        >
          <Store className="h-3.5 w-3.5" />
          All Stores
        </Link>
      </div>
    </div>
  );
}
