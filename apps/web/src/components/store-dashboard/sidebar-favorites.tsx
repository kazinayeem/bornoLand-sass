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
  isBn: boolean;
  onNavigate?: () => void;
}

export function SidebarFavorites({
  basePath,
  pinnedItemIds,
  onTogglePin,
  collapsed,
  isBn,
  onNavigate,
}: SidebarFavoritesProps) {
  const pathname = usePathname();

  if (pinnedItemIds.length === 0) return null;

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

  if (collapsed) return null; // Compact mode hides favorites to reduce clutter

  return (
    <div className="px-1 py-1">
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span>{isBn ? "কুইক অ্যাক্সেস (পিন করা)" : "Quick Access"}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-1 px-1">
        {pinnedItems.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive = item.exact
            ? pathname === href
            : pathname.startsWith(href.split("?")[0]);
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={cn(
                "group flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-md text-[11px] font-medium border transition-all",
                isActive
                  ? "bg-amber-50/80 border-amber-300 text-amber-900 font-semibold dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300"
                  : "bg-white border-zinc-200/80 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
              )}
            >
              <Link
                href={href}
                onClick={onNavigate}
                className="flex items-center gap-1.5 truncate"
              >
                <Icon className="h-3 w-3 text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white" />
                <span className="truncate max-w-[90px]">
                  {isBn ? item.labelBn : item.labelEn}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => onTogglePin(item.id)}
                title={isBn ? "পিন সরান" : "Unpin from quick access"}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-400 hover:text-rose-500 transition-opacity"
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
