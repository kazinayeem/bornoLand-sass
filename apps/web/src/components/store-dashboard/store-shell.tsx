"use client";

import type { ReactNode } from "react";
import { Loader2, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";
import { StoreSidebar } from "@/components/store-dashboard/store-sidebar";
import { TrialBanner } from "@/components/store-dashboard/trial-banner";
import { cn } from "@/lib/utils";

export function StoreShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  // Close mobile nav on escape
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
      <div className="flex h-screen items-center justify-center bg-[#f8f9fb]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-sm text-zinc-400">Loading store...</p>
        </div>
      </div>
    );
  }

  if (isError || !store) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fb] p-6">
        <div className="rounded-2xl border border-[#ececec] bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
            <StoreBrandMark store={{ name: "?", shortName: "?", logoUrl: "", brandColor: "#6366f1" }} size={28} />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Store not found</h2>
          <p className="mt-1.5 text-sm text-zinc-500">This store doesn&apos;t exist or you don&apos;t have access.</p>
          <Link
            href="/dashboard/stores"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800 hover:shadow-lg"
          >
            Back to stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-screen grid-cols-[auto_1fr] overflow-hidden bg-[#f8f9fb]">
      <StoreBrandingSync store={store} />

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <div className="hidden lg:block">
        <StoreSidebar store={store} />
      </div>

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex min-w-0 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 border-b border-[#ececec] bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ececec] transition-colors hover:bg-zinc-50"
            aria-label="Open store menu"
          >
            <Menu className="h-4 w-4 text-zinc-600" />
          </button>
          <StoreBrandMark store={store} size={32} roundedClassName="rounded-lg" />
          <p className="truncate text-sm font-semibold text-zinc-900">{store.shortName || store.name}</p>
        </div>

        {/* Scrollable Content */}
        <main className="content-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
            <TrialBanner store={store} />
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile Sidebar Overlay ───────────────────────────── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-[280px] animate-slide-in-left flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ececec] px-4 py-3">
              <p className="text-sm font-semibold text-zinc-900">{store.shortName || store.name}</p>
              <button
                onClick={closeMobileNav}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="sidebar-scroll flex-1 overflow-y-auto">
              <StoreSidebar store={store} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
