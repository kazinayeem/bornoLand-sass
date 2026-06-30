"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreSidebar } from "@/components/store-dashboard/store-sidebar";
import { StoreNavbar } from "@/components/store-dashboard/store-navbar";
import { TrialBanner } from "@/components/store-dashboard/trial-banner";

export function StoreShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb]">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Store not found</h2>
          <p className="mt-1 text-sm text-zinc-500">This store doesn&apos;t exist or you don&apos;t have access.</p>
          <Link href="/dashboard/stores" className="mt-4 inline-block text-sm font-medium text-zinc-900 underline">
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fb]">
      <div className="hidden lg:block">
        <StoreSidebar store={store} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <StoreNavbar store={store} />
        <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <TrialBanner store={store} />
          {children}
        </main>
      </div>
    </div>
  );
}
