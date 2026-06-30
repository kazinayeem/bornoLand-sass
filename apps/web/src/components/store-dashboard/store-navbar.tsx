"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import type { Store } from "@/redux/api/store-api";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";

export function StoreNavbar({ store }: { store: Store }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">Store</p>
        <h1 className="truncate text-lg font-semibold text-zinc-900">{store.name}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden h-9 w-52 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 sm:inline-flex"
        >
          <Search className="h-4 w-4" />
          Search store...
        </button>
        <Link
          href="/dashboard/notifications"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
        >
          <Bell className="h-4 w-4" />
        </Link>
        <div className="hidden w-48 lg:block">
          <WorkspaceSwitcher collapsed />
        </div>
      </div>
    </header>
  );
}
