"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { BUSINESS_MODULES, findModuleByPathname, type NavItem } from "./navigation-registry";

export type RecentRoute = {
  id: string;
  href: string;
  labelEn: string;
  labelBn: string;
  badgeIcon?: string;
  visitedAt: number;
};

export function useStoreNavState(storeId: string, storeSlug: string) {
  const pathname = usePathname();

  // ── 1. Expanded / Collapsed Modules ──
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    return {
      home: true,
      commerce: true,
      inventory: false,
      purchasing: false,
      pos: true,
      hrm: false,
      finance: false,
      growth: false,
      operations: false,
      website: false,
      system: false,
    };
  });

  // Load persisted expanded state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bornoland_nav_expanded_modules");
      if (saved) {
        const parsed = JSON.parse(saved);
        setExpandedModules((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Auto-expand module containing current pathname
  useEffect(() => {
    if (!pathname || !storeSlug) return;
    const activeMod = findModuleByPathname(pathname, storeSlug);
    if (activeMod && !expandedModules[activeMod.id]) {
      setExpandedModules((prev) => {
        const updated = { ...prev, [activeMod.id]: true };
        try {
          localStorage.setItem("bornoland_nav_expanded_modules", JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    }
  }, [pathname, storeSlug]);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const nextState = !prev[moduleId];
      const updated = { ...prev, [moduleId]: nextState };
      try {
        localStorage.setItem("bornoland_nav_expanded_modules", JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // ── 2. Pinned Favorites ──
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>(() => {
    // Sensible retail ERP defaults
    return ["orders", "inventory-stock", "pos-terminal"];
  });

  useEffect(() => {
    if (!storeId) return;
    try {
      const saved = localStorage.getItem(`bornoland_pinned_${storeId}`);
      if (saved) {
        setPinnedItemIds(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storeId]);

  const togglePin = useCallback(
    (itemId: string) => {
      setPinnedItemIds((prev) => {
        const updated = prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
        try {
          localStorage.setItem(`bornoland_pinned_${storeId}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    },
    [storeId]
  );

  // ── 3. Recent Pages Tracker ──
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([]);

  useEffect(() => {
    if (!storeId) return;
    try {
      const saved = localStorage.getItem(`bornoland_recent_${storeId}`);
      if (saved) {
        setRecentRoutes(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storeId]);

  // Capture visited page
  useEffect(() => {
    if (!pathname || !storeSlug || !storeId) return;
    const relPath = pathname.replace(`/store/${storeSlug}`, "") || "/dashboard";

    // Find matching item in registry
    let foundItem: NavItem | null = null;
    let foundModuleBadge = "";

    for (const mod of BUSINESS_MODULES) {
      for (const item of mod.items) {
        const itemPureHref = item.href.split("?")[0];
        if (item.exact ? relPath === item.href : relPath.startsWith(itemPureHref)) {
          foundItem = item;
          foundModuleBadge = mod.badgeIcon || "";
          break;
        }
      }
      if (foundItem) break;
    }

    if (foundItem) {
      setRecentRoutes((prev) => {
        const filtered = prev.filter((r) => r.id !== foundItem!.id);
        const updated: RecentRoute[] = [
          {
            id: foundItem!.id,
            href: foundItem!.href,
            labelEn: foundItem!.labelEn,
            labelBn: foundItem!.labelBn,
            badgeIcon: foundModuleBadge,
            visitedAt: Date.now(),
          },
          ...filtered,
        ].slice(0, 8); // Keep up to 8 recent entries

        try {
          localStorage.setItem(`bornoland_recent_${storeId}`, JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    }
  }, [pathname, storeSlug, storeId]);

  // ── 4. Active Module ──
  const activeModule = findModuleByPathname(pathname, storeSlug);

  return {
    expandedModules,
    toggleModule,
    pinnedItemIds,
    togglePin,
    recentRoutes,
    activeModule,
  };
}
