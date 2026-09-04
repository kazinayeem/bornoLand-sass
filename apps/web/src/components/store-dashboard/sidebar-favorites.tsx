"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSINESS_MODULES, type NavItem } from "./navigation-registry";

interface SidebarFavoritesProps {
  basePath: string;
  pinnedItemIds: string[];
  onTogglePin: (itemId: string) => void;
  collapsed: boolean;
  isBn?: boolean;
  onNavigate?: () => void;
}

export function SidebarFavorites({
  basePath,
  pinnedItemIds,
  onTogglePin,
  collapsed,
  onNavigate,
}: SidebarFavoritesProps) {
  const pathname = usePathname();

  if (pinnedItemIds.length === 0 || collapsed) return null;

  // Resolve items from registry
  const allItems: NavItem[] = [];
  for (const mod of BUSINESS_MODULES) {
    for (const it of mod.items) {
      allItems.push(it);
    }
  }

  const pinnedItems = pinnedItemIds
    .map((id) => allItems.find((it) => it.id === id))
    .filter(Boolean) as NavItem[];

  if (pinnedItems.length === 0) return null;

  return (
    <div className="px-2 py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
      <div className="flex items-center justify-between px-1 mb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
          <span>Quick Access</span>
        </span>
        <span className="text-[10px] text-zinc-400 font-mono">
          {pinnedItems.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {pinnedItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = item.exact
            ? pathname === href
            : pathname.startsWith(href.split("?")[0]);
          const Icon = item.icon;
          const label = item.labelEn;

          return (
            <div
              key={item.id}
              className={cn(
                "group relative inline-flex items-center gap-1.5 pl-2 pr-1 h-7 rounded-md text-[11px] font-medium border transition-all duration-150 outline-none",
                isActive
                  ? "bg-indigo-50/90 border-indigo-200 text-indigo-950 font-semibold dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200"
                  : "bg-white border-zinc-200/80 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              )}
            >
              <Link
                href={href}
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5 truncate"
                title={label}
              >
                <Icon className={cn("h-3 w-3 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500")} strokeWidth={1.75} />
                <span className="truncate max-w-[100px] leading-none">
                  {label}
                </span>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onTogglePin(item.id);
                }}
                title="Remove from Quick Access"
                aria-label="Remove from Quick Access"
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 hover:text-red-500 transition-opacity"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
