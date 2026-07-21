"use client";

import { useState, useCallback } from "react";
import { Search as SearchIcon, Command } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationDropdown } from "@/components/user/notification-dropdown";
import { ProfileDropdown } from "@/components/user/profile-dropdown";

export function UserNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentStoreId } = useCurrentStore();
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const currentStore = stores.find((s) => s._id === currentStoreId);

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((s, i) => ({
    label: s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  const globalActions = currentStoreId ? [
    { label: "Products", href: `/dashboard/stores/${currentStoreId}`, shortcut: "P" },
    { label: "Orders", href: `/dashboard/stores/${currentStoreId}`, shortcut: "O" },
    { label: "Customers", href: `/dashboard/stores/${currentStoreId}`, shortcut: "C" },
    { label: "Analytics", href: `/dashboard/stores/${currentStoreId}`, shortcut: "A" },
  ] : [];

  const filteredActions = globalActions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = useCallback((href: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-apple-ink">
              {crumbs.length > 1 ? crumbs[crumbs.length - 1].label : "Dashboard"}
            </h1>
            <p className="text-xs text-apple-ink-muted-48">
              {crumbs.map((c, i) => (
                <span key={c.href}>
                  {i > 0 && <span className="mx-1 text-zinc-300">/</span>}
                  {c.label}
                </span>
              ))}
            </p>
          </div>
          {currentStore && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {currentStore.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-apple-canvas-parchment px-3.5 py-2 text-sm text-apple-ink-muted-48 transition-colors hover:border-zinc-300 hover:text-apple-ink-muted-80 w-56"
          >
            <SearchIcon className="h-4 w-4 shrink-0" />
            <span>Quick search...</span>
            <kbd className="ml-auto flex h-5 items-center gap-0.5 rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-apple-ink-muted-48">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </header>

      {/* Global search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                <SearchIcon className="h-5 w-5 text-apple-ink-muted-48 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, orders, customers..."
                  className="flex-1 text-sm text-apple-ink outline-none placeholder:text-apple-ink-muted-48"
                  autoFocus
                />
                <kbd className="flex h-6 items-center rounded-md border border-zinc-200 bg-apple-canvas-parchment px-1.5 text-[10px] font-medium text-apple-ink-muted-48">ESC</kbd>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {filteredActions.length === 0 && query && (
                  <p className="px-3 py-6 text-center text-sm text-apple-ink-muted-48">No results found</p>
                )}
                {filteredActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSelect(action.href)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                  >
                    <span className="flex-1 text-left">{action.label}</span>
                    <kbd className="flex h-6 items-center rounded-md border border-zinc-200 bg-white px-1.5 text-[10px] font-medium text-apple-ink-muted-48">{action.shortcut}</kbd>
                  </button>
                ))}
                {!query && (
                  <p className="px-3 py-3 text-xs text-apple-ink-muted-48">Type to search across your store</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
