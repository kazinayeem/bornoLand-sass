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
    "/dashboard/security": "Security",
    "/dashboard/activity": "Activity Log",
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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-apple-hairline bg-white/80 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => dispatch(toggleMobileSidebar())}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-apple-hairline text-apple-ink-muted-80 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-apple-ink">{pageTitle}</h1>
            <p className="hidden text-xs leading-5 text-apple-ink-muted-48 sm:block">
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
            className="hidden w-52 items-center gap-2 rounded-sm border border-apple-hairline bg-apple-canvas-parchment/80 px-3.5 py-2 text-sm text-apple-ink-muted-48 transition-colors hover:border-apple-hairline hover:bg-apple-canvas sm:inline-flex lg:w-64"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="flex h-5 items-center gap-0.5 rounded-sm border border-apple-hairline bg-apple-canvas px-1.5 text-[10px] font-medium text-apple-ink-muted-48">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-sm border border-apple-hairline text-apple-ink-muted-48 sm:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickOpen(!quickOpen)}
              className="inline-flex h-9 items-center gap-1.5 rounded-pill bg-apple-primary px-3 text-sm font-medium text-apple-on-primary transition-colors hover:bg-apple-primary-focus"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Create</span>
            </button>
            {quickOpen && (
              <>
                <button type="button" className="fixed inset-0 z-40" onClick={() => setQuickOpen(false)} aria-label="Close menu" />
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas py-1">
                  {quickActions.map((action) =>
                    action.disabled ? (
                      <span
                        key={action.label}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-apple-ink-muted-48"
                      >
                        <action.icon className="h-4 w-4" />
                        {action.label}
                      </span>
                    ) : (
                      <Link
                        key={action.label}
                        href={action.href}
                        onClick={() => setQuickOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
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
              className="relative w-full max-w-lg overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas"
            >
              <div className="flex items-center gap-3 border-b border-apple-divider-soft px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-apple-ink-muted-48" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stores, pages..."
                  className="flex-1 text-sm text-apple-ink outline-none placeholder:text-apple-ink-muted-48"
                  autoFocus
                />
                <kbd className="hidden h-6 items-center rounded-sm border border-apple-hairline bg-apple-canvas-parchment px-1.5 text-[10px] font-medium text-apple-ink-muted-48 sm:flex">
                  ESC
                </kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-8 text-center text-sm text-apple-ink-muted-48">No results found</p>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={`${item.href}-${item.label}`}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-apple-canvas-parchment"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-apple-ink">{item.label}</p>
                        <p className="text-xs text-apple-ink-muted-48">{item.sub}</p>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-apple-ink-muted-48">{item.type}</span>
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
