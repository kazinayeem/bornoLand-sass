"use client";

import { ShieldAlert, ArrowLeft, Store } from "lucide-react";
import Link from "next/link";
import { useStorePage } from "@/components/store-dashboard/store-page";

export default function AccessDeniedPage() {
  const { store } = useStorePage();
  const slug = store?.slug || "";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Permission Required
      </h1>
      <p className="mt-2 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
        You do not have the required permissions to access this page or resource in this store. Please contact your store owner to request access.
      </p>

      <div className="mt-8 flex items-center gap-3">
        {slug && (
          <Link
            href={`/store/${slug}/dashboard`}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <Store className="h-4 w-4" />
            <span>Store Dashboard</span>
          </Link>
        )}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Workspace Home</span>
        </Link>
      </div>
    </div>
  );
}
