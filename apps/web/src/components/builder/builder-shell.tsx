"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";
import { LoadingSpinner } from "@/components/loading/loading-spinner";

export function BuilderShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();

  if (isLoading) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-3 bg-zinc-950"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingSpinner size="lg" label="Loading builder" className="text-apple-ink-muted-48" />
        <p className="text-caption text-apple-ink-muted-48">Loading builder…</p>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-lg font-semibold text-white">Store not found</h2>
          <p className="mt-1 text-sm text-apple-ink-muted-48">This store doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/dashboard/stores" className="mt-4 inline-block text-sm font-medium text-white underline">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-apple-canvas-parchment">
      <StoreBrandingSync store={store} />
      {children}
    </div>
  );
}
