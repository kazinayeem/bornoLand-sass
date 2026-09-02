"use client";

import { useStorePage } from "@/components/store-dashboard/store-page";
import { MembersPage } from "@/components/store-dashboard/members/members-page";
import { RequireStorePermission } from "@/components/guards/require-store-permission";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function StoreMembersRoute() {
  const { storeId, store, isLoading } = useStorePage();

  if (isLoading || !storeId || !store) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <RequireStorePermission
      permission="members:read"
      fallback={
        <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200/80 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Access Restricted
          </h2>
          <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            You do not have permission to view or manage team members for this store.
          </p>
          <Link
            href={`/store/${store.slug}/dashboard`}
            className="mt-6 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Back to Dashboard
          </Link>
        </div>
      }
    >
      <MembersPage storeId={storeId} storeSlug={store.slug} />
    </RequireStorePermission>
  );
}
