"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { resolveStoreStatus } from "@/lib/store-status";

export function TrialBanner({ store }: { store: Store }) {
  const status = resolveStoreStatus(store);

  if (status === "trial") {
    const ends = store.trialEndsAt ? new Date(store.trialEndsAt).toLocaleDateString() : "soon";
    return (
      <div className="flex items-center justify-between gap-4 rounded-apple-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p>
          <span className="font-semibold">Trial active</span> — your store works fully until {ends}.
        </p>
        <Link href={`/store/${store.slug}/billing`} className="shrink-0 font-semibold underline-offset-2 hover:underline">
          Upgrade
        </Link>
      </div>
    );
  }

  if (status === "expired" || status === "pending_payment") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-apple-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Payment required</span> — publishing and new orders are disabled.
          </p>
        </div>
        <Link href={`/store/${store.slug}/billing`} className="shrink-0 font-semibold underline-offset-2 hover:underline">
          Upgrade plan
        </Link>
      </div>
    );
  }

  return null;
}
