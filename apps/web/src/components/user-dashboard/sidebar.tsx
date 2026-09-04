"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/redux";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, LogOut, Store, Plus,
  ShoppingBag, Package, Users, FileText, CreditCard,
  Truck, BarChart3, Palette, Settings, ChevronLeft, Bell, Activity, ShieldCheck, HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";
import { toast } from "sonner";

const mainLinks = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/dashboard/stores", label: "দোকানসমূহ", icon: Store },
  { href: "/dashboard/create-store", label: "দোকান তৈরি করুন", icon: Plus },
  { href: "/dashboard/billing", label: "বিলিং", icon: CreditCard },
  { href: "/dashboard/team", label: "টিম", icon: Users },
  { href: "/dashboard/activity", label: "কার্যক্রম", icon: Activity },
  { href: "/dashboard/notifications", label: "নোটিফিকেশন", icon: Bell },
  { href: "/dashboard/analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },
];

const accountLinks = [
  { href: "/dashboard/settings", label: "সেটিংস", icon: Settings },
  { href: "/dashboard/security", label: "নিরাপত্তা", icon: ShieldCheck },
  { href: "/dashboard/help", label: "সহায়তা", icon: HelpCircle },
];

const storeLinks = [
  { id: "overview", label: "ওভারভিউ", icon: LayoutDashboard },
  { id: "products", label: "পণ্যসমূহ", icon: Package },
  { id: "orders", label: "অর্ডারসমূহ", icon: ShoppingBag },
  { id: "customers", label: "কাস্টমার", icon: Users },
  { id: "cms", label: "CMS পেজ", icon: FileText },
  { id: "payments", label: "পেমেন্ট পদ্ধতি", icon: CreditCard },
  { id: "delivery", label: "ডেলিভারি ও কুরিয়ার", icon: Truck },
  { id: "analytics", label: "সেলস অ্যানালিটিক্স", icon: BarChart3 },
  { id: "theme", label: "থিম ডিজাইন", icon: Palette },
  { id: "settings", label: "স্টোর সেটিংস", icon: Settings },
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
  const [hydrated, setHydrated] = useState(false);
  const [logout] = useLogoutMutation();
  useEffect(() => { setHydrated(true); }, []);

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
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-tight text-apple-ink">BornoLand</span>}
        <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "প্রসারিত করুন" : "সংকুচিত করুন"} className={cn("ml-auto flex h-6 w-6 items-center justify-center rounded-md text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80", collapsed && "ml-0")}>
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Store selector */}
      {!collapsed && (
        <div className="border-b border-zinc-100 px-3 py-3">
          <button
            onClick={() => setShowStorePicker(!showStorePicker)}
            className="flex w-full items-center gap-2.5 rounded-xl bg-apple-canvas-parchment p-2.5 transition-colors hover:bg-apple-canvas-parchment"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {currentStore ? currentStore.name[0] : <Store className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-apple-ink">{currentStore?.name || "দোকান বেছে নিন"}</p>
              <p className="truncate text-xs text-apple-ink-muted-48">{currentStore?.plan || "কোনো দোকান নির্বাচন করা হয়নি"}</p>
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
                    s._id === effectiveStoreId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-bold text-apple-ink-muted-48">
                    {s.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="truncate text-xs text-apple-ink-muted-48">{s.slug}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className={cn("mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48", collapsed && "sr-only")}>ওয়ার্কস্পেস</p>
        <ul className="space-y-1">
          {mainLinks.map((link) => {
            const active = pathname === link.href || (link.href === "/dashboard" && pathname === "/dashboard");
            return (
              <li key={link.href}>
                <Link href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-2",
                    active ? "bg-blue-50 text-blue-700 font-semibold" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                  )}>
                  <link.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-apple-ink-muted-48")} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {hydrated && effectiveStoreId && !collapsed && (
          <>
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">দোকান</p>
            <ul className="space-y-1">
              {storeLinks.map((link) => {
                const href = `/dashboard/stores/${effectiveStoreId}`;
                const active = pathname.startsWith(href) && (
                  link.id === "overview"
                    ? pathname === href
                    : pathname.includes(`/${link.id}`) || (
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
                        active ? "bg-blue-50 text-blue-700 font-semibold" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                      )}>
                      <link.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-apple-ink-muted-48")} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {!collapsed && (
          <>
            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-apple-ink-muted-48">অ্যাকাউন্ট</p>
            <ul className="space-y-1">
              {accountLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link href={link.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        active ? "bg-blue-50 text-blue-700 font-semibold" : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                      )}>
                      <link.icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-apple-ink-muted-48")} />
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
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-apple-canvas-parchment p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "ইউ"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-apple-ink">{user?.name ?? "ইউজার"}</p>
              <p className="truncate text-xs text-apple-ink-muted-48">{user?.email ?? ""}</p>
            </div>
          </div>
          <button onClick={async () => { try { await logout().unwrap(); toast.success("লগআউট সম্পন্ন হয়েছে"); window.location.replace("/login"); } catch { toast.error("লগআউট ব্যর্থ হয়েছে"); } }}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" />
            <span className="text-sm">লগআউট</span>
          </button>
        </div>
      )}
    </aside>
  );
}
