"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  LayoutDashboard,
  Lock,
  HardDrive,
  Store as StoreIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { StoreBrandMark } from "./store-brand-mark";
import {
  BUSINESS_MODULES,
  type NavItem,
} from "./navigation-registry";
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
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import { getStoreDisplayDomain, resolveStoreStatus } from "@/lib/store-status";

interface MobileStoreDrawerProps {
  store: Store;
  onClose: () => void;
}

export function MobileStoreDrawer({ store, onClose }: MobileStoreDrawerProps) {
  const pathname = usePathname();
  const basePath = `/store/${store.slug}`;
  const status = resolveStoreStatus(store);
  const domain = getStoreDisplayDomain(store.slug);

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
      if (m.id === "home") return false;
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

  const isDashboardActive = pathname === `${basePath}/dashboard` || pathname === basePath;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950 text-[#181c20] dark:text-zinc-100">
      {/* ── 1. Drawer Header ── */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3.5 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 truncate">
          <StoreBrandMark store={store} size={38} roundedClassName="rounded-xl shadow-2xs shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[18px] font-semibold text-[#181c20] dark:text-zinc-100 leading-tight">
                {store.shortName || store.name}
              </p>
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  status === "active"
                    ? "bg-emerald-500"
                    : status === "trial"
                    ? "bg-[#1664d9]"
                    : "bg-zinc-400"
                )}
                title={status}
              />
            </div>
            <p className="truncate text-[13.5px] text-[#727785] dark:text-zinc-400 font-mono mt-0.5">
              {domain}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#727785] hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close drawer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── 2. Scrollable Body ── */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4" aria-label="Mobile Navigation">
        {/* Store Dashboard Link */}
        <div>
          <Link
            href={`${basePath}/dashboard`}
            onClick={onClose}
            className={cn(
              "relative flex items-center gap-3.5 rounded-xl px-3.5 min-h-[44px] text-[17px] font-semibold transition-all duration-150",
              isDashboardActive
                ? "bg-zinc-100/90 text-[#181c20] dark:bg-zinc-800/80 dark:text-white"
                : "text-[#424754] hover:bg-zinc-100/70 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100"
            )}
          >
            {isDashboardActive && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#1664d9] dark:bg-[#60a5fa]" />
            )}
            <LayoutDashboard
              strokeWidth={isDashboardActive ? 2 : 1.75}
              className={cn(
                "h-[21px] w-[21px] shrink-0",
                isDashboardActive ? "text-[#1664d9] dark:text-[#60a5fa]" : "text-[#727785]"
              )}
            />
            <span className="truncate leading-tight">Store Dashboard</span>
          </Link>
        </div>

        {/* Permitted Business Sections */}
        {permittedModules.map((mod) => {
          const visibleItems = mod.items.filter((it) => !resolveItemAccess(it).noPermission);
          if (visibleItems.length === 0) return null;

          return (
            <div key={mod.id} className="space-y-1">
              <div className="px-3.5 pt-3 pb-1 text-[13px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
                {mod.titleEn}
              </div>

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const access = resolveItemAccess(item);
                  const href = `${basePath}${item.href}`;
                  const isExact = item.exact;
                  const isActive = isExact
                    ? pathname === href
                    : pathname.startsWith(href.split("?")[0]);
                  const ItemIcon = item.icon;
                  const label = item.labelEn;

                  return (
                    <Link
                      key={item.id}
                      href={access.locked ? `${basePath}/billing` : href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-3.5 rounded-xl px-3.5 min-h-[44px] text-[17px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-zinc-100/90 text-[#181c20] font-semibold dark:bg-zinc-800/80 dark:text-white"
                          : "text-[#424754] hover:bg-zinc-100/70 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100",
                        access.locked && "opacity-60"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#1664d9] dark:bg-[#60a5fa]" />
                      )}
                      <ItemIcon
                        strokeWidth={isActive ? 2 : 1.75}
                        className={cn(
                          "h-[21px] w-[21px] shrink-0",
                          isActive ? "text-[#1664d9] dark:text-[#60a5fa]" : "text-[#727785]"
                        )}
                      />
                      <span className="flex-1 truncate leading-tight">{label}</span>
                      {access.locked && <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0 ml-1.5" />}
                      {item.comingSoon && <ComingSoonBadge />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── 3. Drawer Footer ── */}
      <div className="border-t border-[#e2e8f0] p-4 dark:border-zinc-800 shrink-0 space-y-3">
        {/* Storage Bar */}
        <div className="rounded-xl border border-[#dfe3e8] bg-[#f8fafc] p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between text-[13px] font-semibold text-[#181c20] dark:text-zinc-300">
            <span className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-[#727785]" strokeWidth={1.75} />
              <span>Storage</span>
            </span>
            <span className="tabular-nums text-xs font-semibold text-[#727785] dark:text-zinc-400">
              {usedLabel} / {storageLabel}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                storagePercent >= 80 ? "bg-amber-500" : "bg-[#1664d9] dark:bg-[#60a5fa]"
              )}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        <Link
          href="/workshops"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full min-h-[44px] px-3.5 rounded-xl border border-[#dfe3e8] bg-white text-sm font-semibold text-[#181c20] hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 transition-colors"
        >
          <StoreIcon className="h-4 w-4 text-[#727785]" />
          <span>Back to Merchant Workspace</span>
        </Link>
      </div>
    </div>
  );
}
