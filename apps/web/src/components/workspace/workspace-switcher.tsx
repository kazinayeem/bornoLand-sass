"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useAppSelector } from "@/hooks/redux";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const user = useAppSelector((s) => s.user.profile);
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const workspaceName = user?.name ? `${user.name.split(" ")[0]}'s Workspace` : "My Workspace";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-xl border border-apple-hairline bg-apple-canvas-parchment/80 p-2.5 text-left transition-all hover:border-zinc-300 hover:bg-white",
          collapsed && "justify-center p-2"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-apple-ink text-xs font-bold text-white">
          {workspaceName[0]?.toUpperCase() ?? "W"}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-apple-ink">{workspaceName}</p>
              <p className="truncate text-xs text-apple-ink-muted-48">{stores.length} store{stores.length !== 1 ? "s" : ""}</p>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-apple-ink-muted-48" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-apple-hairline bg-white shadow-xl">
          <div className="border-b border-apple-divider-soft px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Workspace</p>
            <p className="truncate text-sm font-medium text-apple-ink">{workspaceName}</p>
          </div>

          <div className="max-h-52 overflow-y-auto p-1.5">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">Stores</p>
            {stores.length === 0 ? (
              <p className="px-2 py-3 text-xs text-apple-ink-muted-48">No stores yet</p>
            ) : (
              stores.map((store) => (
                <button
                  key={store._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/store/${store.slug}/dashboard`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
                >
                  <StoreBrandMark store={store} size={28} roundedClassName="rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{store.shortName || store.name}</p>
                    <p className="truncate text-xs text-apple-ink-muted-48">
                      {typeof store.planId === "object" && store.planId ? store.planId.name : store.plan}
                    </p>
                  </div>
                  <Check className="h-3.5 w-3.5 shrink-0 text-transparent" />
                </button>
              ))
            )}
          </div>

          <div className="border-t border-apple-divider-soft p-1.5">
            <Link
              href="/dashboard/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Link>
            <Link
              href="/dashboard/stores"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <Store className="h-4 w-4" />
              All Stores
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
