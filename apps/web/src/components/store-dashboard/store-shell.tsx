"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";
import { StoreSidebar } from "@/components/store-dashboard/store-sidebar";
import { StoreNavbar } from "@/components/store-dashboard/store-navbar";
import { TrialBanner } from "@/components/store-dashboard/trial-banner";
import { Drawer } from "@/components/ui/drawer";

export function StoreShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isBuilderRoute = pathname?.startsWith(`/store/${store?.slug ?? ""}/builder`);

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
      <StoreBrandingSync store={store} />
      {!isBuilderRoute && (
        <div className="hidden lg:block">
          <StoreSidebar store={store} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        {!isBuilderRoute && (
          <>
            <div className="flex items-center gap-3 border-b border-zinc-200/80 bg-white/90 px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200"
                aria-label="Open store menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <StoreBrandMark store={store} size={32} roundedClassName="rounded-lg" />
              <p className="truncate text-sm font-semibold text-zinc-900">{store.shortName || store.name}</p>
            </div>
            <StoreNavbar store={store} />
          </>
        )}
        <main className={isBuilderRoute ? "flex-1" : "mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8"}>
          {!isBuilderRoute && <TrialBanner store={store} />}
          {children}
        </main>
      </div>

      {!isBuilderRoute && (
        <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title={store.shortName || store.name} side="left" size="full">
          <StoreSidebar store={store} />
        </Drawer>
      )}
    </div>
  );
}
