"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { navGroups, type WorkspaceTabId, type NavGroup, tabLabelMap } from "@/components/workspace/types";
import type { Store as StoreType } from "@/redux/api/store-api";
import {
  ChevronDown, Search, Sparkles, Settings, ExternalLink, Trash2,
} from "lucide-react";
import { getStoreDisplayDomain } from "@/lib/urls";

type StoreNavSidebarProps = {
  store: StoreType;
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  onSettings: () => void;
  onDeleteRequest: () => void;
  onOpenBuilder: () => void;
};

const EXPANDED_KEY = "bn_sidebar_expanded";

function loadExpanded(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EXPANDED_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveExpanded(state: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(state));
  } catch {}
}

function getPlanLabel(store: StoreType) {
  return store.subscriptionStatus ?? store.billingStatus ?? store.plan ?? "draft";
}

function countNavItems(groups: NavGroup[]): number {
  return groups.reduce((s, g) => s + g.items.length, 0);
}

export function StoreNavSidebar({
  store,
  activeTab,
  onTabChange,
  onSettings,
  onDeleteRequest,
  onOpenBuilder,
}: StoreNavSidebarProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded(loadExpanded());
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      saveExpanded(next);
      return next;
    });
  }, []);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return navGroups;
    const q = search.toLowerCase();
    return navGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) || g.label.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [search]);

  const storeDomain = getStoreDisplayDomain(store.subdomain || store.slug);

  return (
    <aside className="flex h-full flex-col border-r border-apple-hairline bg-white">
      {/* Store Header */}
      <div className="border-b border-zinc-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-blue-600 text-sm font-black text-white shadow-sm">
            {store.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-apple-ink">{store.name}</p>
            <p className="truncate text-xs text-apple-ink-muted-48">{storeDomain}</p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", store.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-apple-ink-muted-48")}>
            {store.status}
          </span>
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
            {getPlanLabel(store)}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-zinc-100 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search navigation..."
            className="h-8 w-full rounded-lg border border-zinc-200 bg-apple-canvas-parchment pl-8 pr-3 text-xs outline-none transition-colors focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {filteredGroups.map((group) => {
          const isExpanded = expanded[group.id] ?? true;
          const hasActive = group.items.some((item) => item.id === activeTab);
          const isActiveGroup = hasActive;

          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                  isActiveGroup && !search
                    ? "text-apple-ink"
                    : "text-apple-ink-muted-48 hover:text-apple-ink-muted-80"
                )}
              >
                <group.icon className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">{group.label}</span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
                />
              </button>

              {isExpanded && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.id === activeTab;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                          isActive
                            ? "bg-zinc-900 text-white shadow-sm"
                            : "text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink"
                        )}
                      >
                        <item.icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-white" : "text-apple-ink-muted-48")} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-zinc-100 px-3 py-3">
        <button
          onClick={onOpenBuilder}
          className="flex w-full items-center gap-2 rounded-lg bg-apple-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:brightness-110"
        >
          <Sparkles className="h-3.5 w-3.5" /> Open Builder
        </button>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={onSettings}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1.5 text-[11px] font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
          >
            <Settings className="h-3 w-3" /> Settings
          </button>
          <button
            onClick={onDeleteRequest}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-2 py-1.5 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </div>
      </div>
    </aside>
  );
}
