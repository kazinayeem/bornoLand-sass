"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { useAppSelector } from "@/hooks/redux";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import { useLanguage } from "@/providers/language-provider";

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const params = useParams();
  const routeSlug = typeof params?.storeSlug === "string" ? params.storeSlug : "";
  const currentStore = useAppSelector((s) => s.currentStore);
  const currentStoreSlug = routeSlug || currentStore?.storeSlug;
  const currentStoreId = currentStore?.storeId;
  const { language, t } = useLanguage();
  const isBn = false;
  const user = useAppSelector((s) => s.user.profile);
  const { data } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const workspaceName = firstName
    ? isBn
      ? `${firstName}-এর ওয়ার্কস্পেস`
      : `${firstName}'s Workspace`
    : t.navigation.myWorkspace;

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
          "flex w-full items-center gap-2 rounded-lg border border-zinc-200/90 bg-white p-1.5 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20 shadow-2xs",
          collapsed && "justify-center p-1.5"
        )}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={isBn ? "ওয়ার্কস্পেস মেনু খুলুন" : "Open workspace switcher"}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900 shadow-2xs">
          {workspaceName[0]?.toUpperCase() ?? "W"}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{workspaceName}</p>
              <p className="truncate text-[10.5px] text-zinc-500 dark:text-zinc-400 font-mono">{t.navigation.storesCount(stores.length)}</p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 p-1 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="border-b border-zinc-100 px-2.5 py-1.5 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t.navigation.workspace}</p>
            <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">{workspaceName}</p>
          </div>

          <div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
            <p className="px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{t.navigation.stores}</p>
            {stores.length === 0 ? (
              <p className="px-2 py-3 text-xs text-zinc-400">{t.dropdowns.noNotifications}</p>
            ) : (
              stores.map((store) => {
                const isCurrent = store.slug === currentStoreSlug || store._id === currentStoreId;
                return (
                  <button
                    key={store._id}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      try {
                        localStorage.setItem("bornoland_last_store_slug", store.slug);
                      } catch {
                        // Ignore
                      }
                      router.push(`/store/${store.slug}/dashboard`);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                      isCurrent
                        ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <StoreBrandMark store={store} size={22} roundedClassName="rounded-sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{store.shortName || store.name}</p>
                      <p className="truncate text-[10px] text-zinc-400">
                        {typeof store.planId === "object" && store.planId ? store.planId.name : store.plan}
                      </p>
                    </div>
                    {isCurrent && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-zinc-100 p-1 dark:border-zinc-800 space-y-0.5">
            <Link
              href="/dashboard/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
              <span>{t.navigation.createStore}</span>
            </Link>
            <Link
              href="/workshops"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-zinc-500" />
              <span>{t.navigation.allStores}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
