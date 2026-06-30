"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useAppSelector } from "@/hooks/redux";

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
          "flex w-full items-center gap-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-2.5 text-left transition-all hover:border-zinc-300 hover:bg-white",
          collapsed && "justify-center p-2"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white">
          {workspaceName[0]?.toUpperCase() ?? "W"}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{workspaceName}</p>
              <p className="truncate text-xs text-zinc-500">{stores.length} store{stores.length !== 1 ? "s" : ""}</p>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-zinc-400" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="border-b border-zinc-100 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Workspace</p>
            <p className="truncate text-sm font-medium text-zinc-900">{workspaceName}</p>
          </div>

          <div className="max-h-52 overflow-y-auto p-1.5">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Stores</p>
            {stores.length === 0 ? (
              <p className="px-2 py-3 text-xs text-zinc-500">No stores yet</p>
            ) : (
              stores.map((store) => (
                <button
                  key={store._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(`/store/${store.slug}`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-600">
                    {store.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{store.name}</p>
                    <p className="truncate text-xs text-zinc-400">{store.slug}</p>
                  </div>
                  <Check className="h-3.5 w-3.5 shrink-0 text-transparent" />
                </button>
              ))
            )}
          </div>

          <div className="border-t border-zinc-100 p-1.5">
            <Link
              href="/dashboard/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Link>
            <Link
              href="/dashboard/stores"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
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
