"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, ChevronRight, Menu } from "lucide-react";

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname();
  const labels: Record<string, string> = {
    "/admin/dashboard": "Dashboard",
    "/admin/dashboard/users": "Users",
    "/admin/dashboard/stores": "Stores",
    "/admin/dashboard/subscriptions": "Subscriptions",
    "/admin/dashboard/plans": "Plans",
    "/admin/dashboard/payments": "Payments & Review",
    "/admin/dashboard/analytics": "Analytics",
    "/admin/dashboard/platform": "Platform",
    "/admin/dashboard/settings": "Settings",
    "/admin/dashboard/templates": "Themes",
    "/admin/dashboard/products": "Products",
    "/admin/dashboard/orders": "Orders",
    "/admin/dashboard/features": "Features",
    "/admin/dashboard/storage": "Storage",
    "/admin/dashboard/workspaces": "Workspaces",
  };
  const pageTitle =
    labels[pathname] ??
    (pathname.startsWith("/admin/dashboard/plans/") ? "Plan Builder" : pathname.startsWith("/admin/dashboard/stores/") ? "Store Details" : "Dashboard");
  const breadcrumbs = [{ label: "Dashboard", href: "/admin/dashboard" }, { label: pageTitle }];

  return (
    <header className="sticky top-0 z-30 border-b border-apple-hairline bg-apple-canvas/80 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-sm text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-apple-ink">{pageTitle}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs leading-5 text-apple-ink-muted-48">
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
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
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-ink-muted-48" />
            <input
              type="text"
              placeholder="Search platform..."
            className="h-9 w-56 rounded-sm border border-apple-hairline bg-apple-canvas-parchment/80 pl-9 pr-4 text-sm text-apple-ink placeholder:text-apple-ink-muted-48 focus:border-apple-primary focus:outline-none focus:ring-2 focus:ring-apple-primary/20"
            />
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-apple-hairline bg-apple-canvas text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-apple-primary text-sm font-semibold text-apple-on-primary">
            SA
          </div>
        </div>
      </div>
    </header>
  );
}
