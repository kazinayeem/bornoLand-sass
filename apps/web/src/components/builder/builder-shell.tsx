"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";

export function BuilderShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-lg font-semibold text-white">Store not found</h2>
          <p className="mt-1 text-sm text-zinc-400">This store doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/dashboard/stores" className="mt-4 inline-block text-sm font-medium text-white underline">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-50">
      <StoreBrandingSync store={store} />
      {children}
    </div>
  );
}
