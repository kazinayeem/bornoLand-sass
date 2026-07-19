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
    <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 px-4 py-3 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-950">{pageTitle}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs leading-5 text-zinc-500">
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" />}
                  {item.href ? (
                    <Link href={item.href} className="hover:text-zinc-700">
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search platform..."
            className="h-9 w-56 rounded-xl border border-zinc-200/80 bg-zinc-50/80 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50"
          >
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
            SA
          </div>
        </div>
      </div>
    </header>
  );
}
