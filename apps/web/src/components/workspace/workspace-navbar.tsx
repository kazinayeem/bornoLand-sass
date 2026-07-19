"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Command,
  Menu,
  Plus,
  Store,
  UserPlus,
  CreditCard,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { toggleMobileSidebar } from "@/redux/slices/ui-slice";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { ProfileDropdown } from "@/components/user/profile-dropdown";

const quickActions = [
  { label: "New Store", href: "/dashboard/stores/create", icon: Store },
  { label: "Import Store", href: "/dashboard/stores", icon: Upload, disabled: true },
  { label: "Invite Member", href: "/dashboard/team", icon: UserPlus },
  { label: "Upgrade Plan", href: "/dashboard/billing", icon: CreditCard },
];

export function WorkspaceNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.profile);
  const currentStore = useAppSelector((s) => s.currentStore);
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];

  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [query, setQuery] = useState("");

  const segments = pathname.split("/").filter(Boolean);
  const routeLabels: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/stores": "Stores",
    "/dashboard/stores/create": "Create Store",
    "/dashboard/billing": "Billing",
    "/dashboard/team": "Team",
    "/dashboard/account": "Account",
    "/dashboard/orders": "Orders",
    "/dashboard/products": "Products",
    "/dashboard/categories": "Categories",
    "/dashboard/cms": "CMS",
    "/dashboard/settings": "Settings",
    "/dashboard/notifications": "Notifications",
    "/dashboard/help": "Help",
  };
  const pageTitle = routeLabels[pathname]
    ?? (pathname.startsWith("/dashboard/stores/") ? "Store Details" : segments.length > 1
      ? segments[segments.length - 1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Dashboard");
  const contextTitle =
    currentStore.initialized && currentStore.storeName ? currentStore.storeName : "Workspace";

  const searchResults = [
    ...stores.map((s) => ({
      label: s.name,
      sub: s.slug,
      href: `/store/${s.slug}/dashboard`,
      type: "Store",
    })),
    { label: "All Stores", sub: "Workspace", href: "/dashboard/stores", type: "Page" },
    { label: "Create Store", sub: "Workspace", href: "/dashboard/stores/create", type: "Page" },
    { label: "Billing", sub: "Workspace", href: "/dashboard/billing", type: "Page" },
    { label: "Team", sub: "Workspace", href: "/dashboard/team", type: "Page" },
  ].filter((item) =>
    !query || item.label.toLowerCase().includes(query.toLowerCase()) || item.sub.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback(
    (href: string) => {
      setSearchOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuickOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleMobileSidebar())}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">{pageTitle}</h1>
            <p className="hidden text-xs text-zinc-500 sm:block">
              <span>{contextTitle}</span>
              <span className="mx-1 text-zinc-300">/</span>
              {segments.map((s, i) => (
                <span key={`${s}-${i}`}>
                  {i > 0 && <span className="mx-1 text-zinc-300">/</span>}
                  {s.replace(/-/g, " ")}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 text-sm text-zinc-500 transition-colors hover:border-zinc-300 hover:bg-white sm:inline-flex w-52 lg:w-64"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="flex h-5 items-center gap-0.5 rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-zinc-400">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 sm:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickOpen(!quickOpen)}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Create</span>
            </button>
            {quickOpen && (
              <>
                <button type="button" className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} aria-label="Close menu" />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl">
                  {quickActions.map((action) =>
                    action.disabled ? (
                      <span
                        key={action.label}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400"
                      >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </span>
                    ) : (
                      <Link
                        key={action.label}
                        href={action.href}
                        onClick={() => setQuickOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                      >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </Link>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-20 sm:pt-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-zinc-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stores, pages..."
                  className="flex-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                  autoFocus
                />
                <kbd className="hidden h-6 items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 text-[10px] font-medium text-zinc-400 sm:flex">
                  ESC
                </kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-zinc-400">No results found</p>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={`${item.href}-${item.label}`}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-zinc-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900">{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.sub}</p>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">{item.type}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
