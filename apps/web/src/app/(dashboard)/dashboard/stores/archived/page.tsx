"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Archive, Loader2, Plus } from "lucide-react";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { PageHeader } from "@/components/workspace/page-header";
import { resolveStoreStatus } from "@/lib/store-status";

export default function ArchivedStoresPage() {
  const { data, isLoading } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

  const archivedStores = useMemo(
    () => stores.filter((s) => resolveStoreStatus(s) === "archived" || s.status === "suspended"),
    [stores]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Archived Stores"
        description="Stores that have been archived or suspended."
        actions={
          <Link
            href="/dashboard/stores"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
          >
            View active stores
          </Link>
        }
      />

      {archivedStores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Archive className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-lg font-semibold text-apple-ink">No archived stores</h3>
          <p className="mt-1 text-sm text-apple-ink-muted-48">Archived stores will appear here.</p>
          <Link
            href="/dashboard/stores/create"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Create Store
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {archivedStores.map((store) => (
            <Link
              key={store._id}
              href={`/store/${store.slug}`}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-4 transition-colors hover:bg-apple-canvas-parchment"
            >
              <div>
                <p className="font-medium text-apple-ink">{store.name}</p>
                <p className="text-sm text-apple-ink-muted-48">{store.slug}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-apple-ink-muted-80">
                {store.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
