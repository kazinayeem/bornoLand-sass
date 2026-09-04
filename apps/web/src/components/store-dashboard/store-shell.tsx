"use client";

import type { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useStoreFromSlug } from "@/hooks/use-store-from-slug";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { StoreBrandingSync } from "@/components/store-dashboard/store-branding-sync";
import { StorePermissionsSync } from "@/components/store-dashboard/store-permissions-sync";
import { StoreSidebar } from "@/components/store-dashboard/store-sidebar";
import { EmployeeSidebar } from "@/components/store-dashboard/employee-sidebar";
import { MobileStoreDrawer } from "@/components/store-dashboard/mobile-store-drawer";
import { TrialBanner } from "@/components/store-dashboard/trial-banner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useMemberRole } from "@/features/session/hooks";

export function StoreShell({ children }: { children: ReactNode }) {
  const { store, isLoading, isError } = useStoreFromSlug();
  const memberRole = useMemberRole();
  const isEmployee = memberRole === "employee";
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
      <div className="flex h-screen overflow-hidden bg-apple-canvas-parchment">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex w-64 flex-col border-r border-apple-hairline bg-apple-canvas p-4 space-y-4 animate-pulse">
          <div className="h-10 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2 pt-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-14 border-b border-apple-hairline bg-apple-canvas px-6 flex items-center justify-between animate-pulse">
            <div className="h-6 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
              <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-apple-canvas border border-apple-hairline" />
                ))}
              </div>
              <div className="h-64 rounded-xl bg-apple-canvas border border-apple-hairline" />
            </div>
          </main>
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
      <StorePermissionsSync storeId={store._id} />

      <div className="hidden lg:block">
        {isEmployee ? (
          <EmployeeSidebar store={store} />
        ) : (
          <StoreSidebar store={store} />
        )}
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
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
            onClick={closeMobileNav}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,340px)] animate-in slide-in-from-left duration-200 flex-col border-r border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            {isEmployee ? (
              <EmployeeSidebar store={store} onNavigate={closeMobileNav} />
            ) : (
              <MobileStoreDrawer store={store} onClose={closeMobileNav} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
