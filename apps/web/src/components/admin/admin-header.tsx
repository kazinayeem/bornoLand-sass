"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { getAdminPageTitle } from "@/lib/admin/admin-nav-config";
import { AdminProfileDropdown } from "@/components/admin/admin-profile-dropdown";
import { useAdminLayout } from "@/components/admin/admin-layout-context";

export function AdminHeader() {
  const pathname = usePathname();
  const { setMobileOpen } = useAdminLayout();
  const pageTitle = getAdminPageTitle(pathname);
  const breadcrumbs = [
    { label: "Platform", href: "/admin/dashboard" },
    { label: pageTitle },
  ];

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-apple-hairline bg-apple-canvas/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-apple-ink">{pageTitle}</h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-apple-ink-muted-48">
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-apple-ink-muted-48" />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-apple-ink-muted-80">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              type="search"
              placeholder="Search platform…"
              className="h-10 w-52 rounded-lg border border-apple-hairline bg-apple-canvas-parchment/80 pl-9 pr-4 text-sm text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/20 lg:w-64"
            />
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-apple-hairline bg-apple-canvas text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <AdminProfileDropdown />
        </div>
      </div>
    </header>
  );
}
