"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, LogOut, Store, Plus,
  ShoppingBag, Package, Users, FileText, CreditCard,
  Truck, BarChart3, Palette, Settings, ChevronLeft, Search,
} from "lucide-react";
import { useState } from "react";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetMyStoresQuery } from "@/redux/api/store-api";

const mainLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "All Stores", icon: Store },
  { href: "/dashboard/create-store", label: "Create Store", icon: Plus },
];

const storeLinks = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "cms", label: "CMS", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings },
];

export function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppSelector((s) => s.user.profile);
  const { currentStoreId } = useCurrentStore();
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [collapsed, setCollapsed] = useState(false);
  const [showStorePicker, setShowStorePicker] = useState(false);

  const currentStore = stores.find((s) => s._id === currentStoreId);

  const isStoreDashboard = pathname.startsWith("/dashboard/stores/");
  const storeIdFromPath = isStoreDashboard ? pathname.split("/")[3] : null;
  const effectiveStoreId = storeIdFromPath || currentStoreId;

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200 bg-white shadow-sm transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-zinc-100 gap-2.5 px-5", collapsed && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight text-zinc-900">BornoLand</span>}
        <button onClick={() => setCollapsed(!collapsed)} className={cn("ml-auto flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600", collapsed && "ml-0")}>
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Store selector */}
      {!collapsed && (
        <div className="border-b border-zinc-100 px-3 py-3">
          <button
            onClick={() => setShowStorePicker(!showStorePicker)}
            className="flex w-full items-center gap-2.5 rounded-xl bg-zinc-50 p-2.5 transition-colors hover:bg-zinc-100"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {currentStore ? currentStore.name[0] : <Store className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-zinc-900">{currentStore?.name || "Select Store"}</p>
              <p className="truncate text-xs text-zinc-400">{currentStore?.plan || "No store selected"}</p>
            </div>
          </button>
          {showStorePicker && (
            <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
              {stores.map((s) => (
                <button
                  key={s._id}
                  onClick={() => {
                    router.push(`/dashboard/stores/${s._id}`);
                    setShowStorePicker(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    s._id === effectiveStoreId ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-500">
                    {s.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="truncate text-xs text-zinc-400">{s.slug}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className={cn("mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400", collapsed && "sr-only")}>General</p>
        <ul className="space-y-1">
          {mainLinks.map((link) => {
            const active = pathname === link.href || (link.href === "/dashboard" && pathname === "/dashboard");
            return (
              <li key={link.href}>
                <Link href={link.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    active ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}>
                  <link.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-zinc-400")} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {effectiveStoreId && !collapsed && (
          <>
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Store</p>
            <ul className="space-y-1">
              {storeLinks.map((link) => {
                const href = `/dashboard/stores/${effectiveStoreId}`;
                const active = pathname.startsWith(href) && (
                  link.id === "overview"
                    ? pathname === href
                    : pathname.includes(`/${link.id}`) || (
                      // For store-specific routes like /dashboard/cms which aren't under /stores/[id]
                      link.id === "cms" && pathname.startsWith("/dashboard/cms")
                    )
                );
                return (
                  <li key={link.id}>
                    <Link href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(href);
                      }}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      )}>
                      <link.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-zinc-400")} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="border-t border-zinc-100 p-3">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{user?.name ?? "User"}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email ?? ""}</p>
            </div>
          </div>
          <button onClick={() => router.push("/login")}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
