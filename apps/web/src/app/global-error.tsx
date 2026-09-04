"use client";

import { useEffect, useState } from "react";
import { isChunkLoadError, attemptChunkReload, triggerHardReload } from "@/lib/chunk-error-recovery";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    console.error("[GlobalError]", error);
    if (isChunkLoadError(error)) {
      setIsChunkError(true);
      attemptChunkReload();
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${isChunkError ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"}`}>
            <svg className="h-7 w-7 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {isChunkError ? "Application Update Available" : "Application Error"}
          </h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {isChunkError
              ? "A newer version of BornoLand was deployed. Please reload the page to load the latest components."
              : error.message || "An unexpected error occurred. Please try reloading or return home."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => (isChunkError ? triggerHardReload() : reset())}
              className={`rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors ${
                isChunkError
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              }`}
            >
              {isChunkError ? "Reload Application" : "Try Again"}
            </button>
            <a
              href="/"
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-xs font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
