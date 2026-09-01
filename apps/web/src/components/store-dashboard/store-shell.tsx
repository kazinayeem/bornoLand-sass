"use client";

import type { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";
import { StoreSidebar } from "@/components/store-dashboard/store-sidebar";
import { TrialBanner } from "@/components/store-dashboard/trial-banner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export function StoreShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    if (mobileNavOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen, closeMobileNav]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-apple-canvas-parchment">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-apple-primary" />
          <p className="text-caption text-apple-ink-muted-48">Loading store...</p>
        </div>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex h-screen items-center justify-center bg-apple-canvas-parchment p-6">
        <div className="rounded-lg border border-apple-hairline bg-apple-canvas p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-apple-canvas-parchment">
            <StoreBrandMark
              store={{ name: "?", shortName: "?", logoUrl: "", brandColor: "#0066cc" }}
              size={28}
            />
          </div>
          <h2 className="text-body-strong text-apple-ink">Store not found</h2>
          <p className="mt-1.5 text-caption text-apple-ink-muted-48">
            This store doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Link
            href="/dashboard/stores"
            className="btn-press mt-5 inline-flex items-center gap-2 rounded-pill bg-apple-primary px-[22px] py-[11px] text-body text-apple-on-primary"
          >
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-surface="dashboard" className="grid h-screen grid-cols-[auto_1fr] overflow-hidden bg-zinc-50/70 dark:bg-zinc-950">
      <StoreBrandingSync store={store} />

      <div className="hidden lg:block">
        <StoreSidebar store={store} />
      </div>

      <div className="flex min-w-0 flex-col overflow-hidden">
        <DashboardHeader mode="store" store={store} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="content-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
            <TrialBanner store={store} />
            {children}
          </div>
        </main>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] animate-in slide-in-from-left duration-200 flex-col border-r border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <StoreBrandMark store={store} size={28} roundedClassName="rounded-md" />
                <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {store.shortName || store.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMobileNav}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="sidebar-scroll flex-1 overflow-y-auto">
              <StoreSidebar store={store} onNavigate={closeMobileNav} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
