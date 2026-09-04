"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Lock,
  Star,
  HardDrive,
  Plus,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { StoreBrandMark } from "./store-brand-mark";
import {
  BUSINESS_MODULES,
  type BusinessModule,
  type NavItem,
} from "./navigation-registry";
import { useLanguage } from "@/providers/language-provider";
import {
  useIsStoreOwner,
  usePermissions,
  checkPermission,
} from "@/features/session/hooks";
import {
  useGetStoreFeatureAccessQuery,
  NAV_FEATURE_MAP,
  getFeatureByKey,
} from "@/redux/api/feature-api";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { useStoreContext } from "@/providers/store-context";
import { useStoreNavState } from "./use-store-nav-state";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";

interface MobileStoreDrawerProps {
  store: Store;
  onClose: () => void;
}

export function MobileStoreDrawer({ store, onClose }: MobileStoreDrawerProps) {
  const pathname = usePathname();
  const { language, t } = useLanguage();
  const isBn = language === "bn";
  const basePath = `/store/${store.slug}`;

  // Entitlements & Permissions
  const storeContext = useStoreContext();
  const contextFeatures = (storeContext.features as { features?: any[] } | null)?.features;
  const contextStats = storeContext.storageStats;

  const { data: accessData } = useGetStoreFeatureAccessQuery(store._id, {
    skip: !store._id || Boolean(contextFeatures && contextFeatures.length > 0),
  });
  const { data: storageData } = useGetMediaStatsQuery(store._id, {
    skip: !store._id || Boolean(contextStats),
  });

  const features = contextFeatures ?? accessData?.data?.features ?? [];
  const stats = contextStats ?? storageData?.data?.stats;
  const isOwner = useIsStoreOwner();
  const permissionSet = usePermissions();

  const {
    expandedModules,
    toggleModule,
    pinnedItemIds,
    togglePin,
    activeModule,
  } = useStoreNavState(store._id, store.slug);

  const resolveItemAccess = useCallback(
    (item: NavItem) => {
      const key = item.featureKey ?? NAV_FEATURE_MAP[item.labelEn];
      const feature = key ? getFeatureByKey(features, key) : undefined;
      const hasPerm = isOwner || !item.permission || checkPermission(permissionSet, item.permission);

      return {
        locked: feature?.locked ?? false,
        noPermission: !hasPerm,
        requiredPlan: feature?.requiredPlan?.name,
        comingSoon: item.comingSoon || feature?.comingSoon,
      };
    },
    [features, isOwner, permissionSet]
  );

  // Filter permitted modules
  const permittedModules = useMemo(() => {
    return BUSINESS_MODULES.filter((m) => {
      if (m.id === "home") return true;
      return m.items.some((it) => !resolveItemAccess(it).noPermission);
    });
  }, [resolveItemAccess]);

  const storagePercent = Math.min(stats?.percentUsed ?? 0, 100);
  const storageLabel = stats?.unlimited
    ? "Unlimited"
    : stats?.limitMB != null && stats.limitMB >= 1024
    ? `${(stats.limitMB / 1024).toFixed(0)} GB`
    : `${stats?.limitMB ?? 0} MB`;
  const usedLabel = stats?.usedMB != null
    ? stats.usedMB >= 1024
      ? `${(stats.usedMB / 1024).toFixed(2)} GB`
      : `${stats.usedMB.toFixed(1)} MB`
    : "0 B";

  // All items for pinned quick access
  const allItems: NavItem[] = useMemo(() => {
    const list: NavItem[] = [];
    for (const mod of BUSINESS_MODULES) {
      for (const it of mod.items) {
        list.push(it);
      }
    }
    return list;
  }, []);

  const pinnedItems = useMemo(() => {
    return pinnedItemIds
      .map((id) => allItems.find((it) => it.id === id))
      .filter(Boolean) as NavItem[];
  }, [pinnedItemIds, allItems]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* ── Drawer Header ── */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2.5 truncate">
          <StoreBrandMark store={store} size={30} roundedClassName="rounded-md shadow-2xs" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {store.shortName || store.name}
            </p>
            <p className="truncate text-[10px] text-zinc-500 font-mono">
              {store.slug}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          aria-label={isBn ? "মেনু বন্ধ করুন" : "Close drawer"}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Quick Access Pinned Buttons */}
        {pinnedItems.length > 0 && (
          <div>
            <p className="px-1 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
              <span>{isBn ? "কুইক অ্যাক্সেস" : "Quick Access"}</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {pinnedItems.map((item) => {
                const href = `${basePath}${item.href}`;
                const isActive = item.exact
                  ? pathname === href
                  : pathname.startsWith(href.split("?")[0]);
                const Icon = item.icon;
                const label = isBn ? item.labelBn : item.labelEn;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors",
                      isActive
                        ? "bg-indigo-50/90 border-indigo-200 text-indigo-950 font-semibold dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-200"
                        : "bg-zinc-50/60 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" strokeWidth={1.75} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Home / Overview Link */}
        <div>
          <Link
            href={`${basePath}/dashboard`}
            onClick={onClose}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors",
              pathname === `${basePath}/dashboard`
                ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white"
                : "bg-zinc-50 border-zinc-200 text-zinc-800 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{isBn ? "স্টোর ড্যাশবোর্ড" : "Store Dashboard"}</span>
          </Link>
        </div>

        {/* Collapsible Navigation Modules */}
        <div className="space-y-1">
          {permittedModules.map((mod) => {
            if (mod.id === "home") return null;

            const visibleItems = mod.items.filter((it) => !resolveItemAccess(it).noPermission);
            if (visibleItems.length === 0) return null;

            const isExpanded = Boolean(expandedModules[mod.id]);
            const isModuleActive = mod.id === activeModule.id;
            const ModIcon = mod.icon;

            return (
              <div key={mod.id} className="rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors",
                    isModuleActive
                      ? "text-indigo-950 dark:text-indigo-200 font-bold"
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/60"
                  )}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ModIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.75} />
                    <span className="truncate text-[11px]">
                      {isBn ? mod.titleBn : mod.titleEn}
                    </span>
                  </div>
                  <span className="text-zinc-400">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 mt-0.5 pl-2">
                    {visibleItems.map((item) => {
                      const access = resolveItemAccess(item);
                      const href = `${basePath}${item.href}`;
                      const isExact = item.exact;
                      const isActive = isExact
                        ? pathname === href
                        : pathname.startsWith(href.split("?")[0]);
                      const ItemIcon = item.icon;
                      const label = isBn ? item.labelBn : item.labelEn;

                      return (
                        <Link
                          key={item.id}
                          href={access.locked ? `${basePath}/billing` : href}
                          onClick={onClose}
                          className={cn(
                            "relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                            isActive
                              ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                            access.locked && "opacity-60"
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                          )}
                          <ItemIcon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} strokeWidth={1.75} />
                          <span className="flex-1 truncate">{label}</span>
                          {access.locked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                          {item.comingSoon && <ComingSoonBadge />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Drawer Footer ── */}
      <div className="border-t border-zinc-200/80 p-3 dark:border-zinc-800 shrink-0 space-y-2">
        {/* Storage Bar */}
        <div className="rounded-lg border border-zinc-200/60 bg-zinc-50/70 p-2 dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3 w-3 text-zinc-400" strokeWidth={1.75} />
              <span>{isBn ? "স্টোরেজ" : "Storage"}</span>
            </span>
            <span className="tabular-nums font-semibold text-zinc-700 dark:text-zinc-300">
              {usedLabel} / {storageLabel}
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                storagePercent >= 80 ? "bg-amber-500" : "bg-indigo-600 dark:bg-indigo-400"
              )}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition-colors"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>{isBn ? "ওয়ার্কস্পেস ড্যাশবোর্ড" : "Back to Workspace"}</span>
        </Link>
      </div>
    </div>
  );
}
