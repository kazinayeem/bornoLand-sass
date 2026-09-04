"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Star,
  HardDrive,
  ChevronsUpDown,
  Check,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Lock,
  Store as StoreIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { resolveStoreStatus, getStoreDisplayDomain } from "@/lib/store-status";
import {
  useGetStoreFeatureAccessQuery,
  NAV_FEATURE_MAP,
  getFeatureByKey,
} from "@/redux/api/feature-api";
import { ComingSoonBadge } from "@/components/ecommerce/coming-soon-badge";
import { useGetMediaStatsQuery } from "@/redux/api/media-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/providers/language-provider";
import { useStoreContext } from "@/providers/store-context";
import {
  useIsStoreOwner,
  usePermissions,
  checkPermission,
} from "@/features/session/hooks";

import {
  BUSINESS_MODULES,
  type BusinessModule,
  type NavItem,
  findModuleByPathname,
} from "./navigation-registry";
import { useStoreNavState } from "./use-store-nav-state";
import { SidebarModuleSwitcher } from "./sidebar-module-switcher";
import { SidebarFavorites } from "./sidebar-favorites";

/* ── Sidebar Collapse Context ─────────────────────────────────── */

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

/* ── Store Switcher Dropdown (Top Header) ───────────────────────── */

function SidebarStoreSwitcher({
  store,
  collapsed,
}: {
  store: Store;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t, language } = useLanguage();
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const status = resolveStoreStatus(store);
  const domain = getStoreDisplayDomain(store.slug);
  const isBn = false;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={switcherRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl p-1.5 transition-all duration-150 text-left outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20",
          collapsed ? "justify-center p-1" : ""
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={isBn ? "স্টোর পরিবর্তন করুন" : "Switch workspace store"}
      >
        <StoreBrandMark
          store={store}
          size={collapsed ? 34 : 32}
          roundedClassName="rounded-lg shadow-2xs shrink-0"
        />

        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {store.shortName || store.name}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  status === "active"
                    ? "bg-emerald-500"
                    : status === "trial"
                    ? "bg-indigo-500"
                    : "bg-zinc-400"
                )}
                title={status}
              />
            </div>
            <span className="truncate text-[10.5px] text-zinc-500 dark:text-zinc-400 font-mono">
              {domain}
            </span>
          </div>
        )}

        {!collapsed && (
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-zinc-200/90 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <span>{isBn ? "অনুমোদিত স্টোরসমূহ" : "Authorized Stores"}</span>
            <span className="font-mono">{stores.length}</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5">
            {stores.map((s) => {
              const isCurrent = s._id === store._id;
              return (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    try {
                      localStorage.setItem("bornoland_last_store_slug", s.slug);
                    } catch {
                      // Ignore
                    }
                    router.push(`/store/${s.slug}/dashboard`);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors text-left",
                    isCurrent
                      ? "bg-zinc-100 font-semibold text-zinc-950 dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <StoreBrandMark store={s} size={20} roundedClassName="rounded-sm" />
                    <span className="truncate">{s.shortName || s.name}</span>
                  </div>
                  {isCurrent && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800 space-y-0.5">
            <Link
              href="/workshops"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isBn ? "মার্চেন্ট ওয়ার্কস্পেস" : "Merchant Workspace"}</span>
            </Link>
            <Link
              href="/dashboard/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
              <span>{isBn ? "নতুন স্টোর তৈরি করুন" : "Create New Store"}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Individual Nav Item Row ───────────────────────────────────── */

function SidebarNavItem({
  item,
  basePath,
  collapsed,
  isBn,
  isPinned,
  onTogglePin,
  onNavigate,
  locked,
  requiredPlan,
}: {
  item: NavItem;
  basePath: string;
  collapsed: boolean;
  isBn: boolean;
  isPinned: boolean;
  onTogglePin: (id: string) => void;
  onNavigate?: () => void;
  locked?: boolean;
  requiredPlan?: string;
}) {
  const pathname = usePathname();
  const href = `${basePath}${item.href}`;
  const isExact = item.exact;
  const isActive = isExact
    ? pathname === href
    : pathname.startsWith(href.split("?")[0]);

  const Icon = item.icon;
  const label = isBn ? item.labelBn : item.labelEn;

  const content = (
    <div className="group/item relative flex items-center">
      <Link
        href={locked ? `${basePath}/billing` : href}
        onClick={onNavigate}
        className={cn(
          "relative flex flex-1 items-center gap-2.5 rounded-lg px-2.5 h-9 text-xs font-medium transition-all duration-150 outline-none",
          isActive
            ? "bg-zinc-100/90 text-zinc-950 font-semibold dark:bg-zinc-800/80 dark:text-white"
            : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100",
          collapsed ? "justify-center px-0 h-9 w-9 mx-auto rounded-lg" : "",
          locked ? "opacity-60" : ""
        )}
        aria-label={label}
      >
        {/* Subtle active left indicator bar */}
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
        )}

        <Icon
          strokeWidth={isActive ? 2 : 1.75}
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-zinc-500 group-hover/item:text-zinc-900 dark:text-zinc-400 dark:group-hover/item:text-white"
          )}
        />

        {!collapsed && (
          <span className="flex-1 truncate text-[12.5px] leading-none">{label}</span>
        )}

        {!collapsed && locked && (
          <Lock className="h-3 w-3 text-amber-500 shrink-0 ml-1" />
        )}

        {!collapsed && item.comingSoon && (
          <ComingSoonBadge />
        )}
      </Link>

      {!collapsed && !locked && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onTogglePin(item.id);
          }}
          title={isPinned ? (isBn ? "পিন সরান" : "Remove pin") : (isBn ? "কুইক অ্যাক্সেসে পিন করুন" : "Pin to Quick Access")}
          aria-label={isPinned ? "Remove pin" : "Pin to Quick Access"}
          className={cn(
            "absolute right-1.5 p-1 rounded transition-opacity outline-none",
            isPinned
              ? "opacity-100 text-amber-500"
              : "opacity-0 group-hover/item:opacity-60 hover:opacity-100 text-zinc-400 hover:text-amber-500"
          )}
        >
          <Star className={cn("h-3 w-3", isPinned ? "fill-amber-400 text-amber-500" : "")} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="py-1 px-2.5 font-medium shadow-md text-xs">
          <span>{label}</span>
          {item.descriptionEn && (
            <span className="block text-[10px] text-zinc-400 font-normal">
              {isBn ? item.descriptionBn : item.descriptionEn}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

/* ── Main ERP Sidebar Component ───────────────────────────────── */

export function StoreSidebar({
  store,
  onNavigate,
}: {
  store: Store;
  onNavigate?: () => void;
}) {
  const { language } = useLanguage();
  const isBn = false;
  const basePath = `/store/${store.slug}`;

  // Persist collapsed state
  const [collapsed, setCollapsedState] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bornoland_sidebar_collapsed");
      if (saved !== null) setCollapsedState(saved === "true");
    } catch {
      // Ignore
    }
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      localStorage.setItem("bornoland_sidebar_collapsed", String(v));
    } catch {
      // Ignore
    }
  }, []);

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

  // Navigation state hook (Favorites, Expanded modules, Active module)
  const {
    expandedModules,
    toggleModule,
    pinnedItemIds,
    togglePin,
    activeModule,
  } = useStoreNavState(store._id, store.slug);

  // Check item permission and entitlement
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

  // Filter modules to only those with visible permitted items
  const permittedModuleIds = useMemo(() => {
    const set = new Set<string>();
    for (const mod of BUSINESS_MODULES) {
      if (mod.id === "home") {
        set.add("home");
        continue;
      }
      const hasVisible = mod.items.some((it) => !resolveItemAccess(it).noPermission);
      if (hasVisible) set.add(mod.id);
    }
    return set;
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

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <aside
          className={cn(
            "sticky top-0 flex h-screen flex-col border-r border-zinc-200/80 bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 select-none",
            collapsed ? "w-[68px]" : "w-[268px]"
          )}
          role="navigation"
          aria-label="Merchant Navigation"
        >
          {/* ── Top: Store Header / Workspace Switcher ── */}
          <div className={cn("shrink-0 border-b border-zinc-200/80 dark:border-zinc-800", collapsed ? "p-2" : "p-2.5")}>
            <SidebarStoreSwitcher store={store} collapsed={collapsed} />
          </div>

          {/* ── Business Module Switcher Grid ── */}
          <div className={cn("shrink-0 border-b border-zinc-100 dark:border-zinc-800/60", collapsed ? "py-1.5" : "")}>
            <SidebarModuleSwitcher
              basePath={basePath}
              activeModuleId={activeModule.id}
              onSelectModule={(mod) => {
                if (!expandedModules[mod.id]) toggleModule(mod.id);
              }}
              collapsed={collapsed}
              isBn={isBn}
              permittedModuleIds={permittedModuleIds}
              onNavigate={onNavigate}
            />
          </div>

          {/* ── Quick Access Favorites ── */}
          <div className="shrink-0">
            <SidebarFavorites
              basePath={basePath}
              pinnedItemIds={pinnedItemIds}
              onTogglePin={togglePin}
              collapsed={collapsed}
              isBn={isBn}
              onNavigate={onNavigate}
            />
          </div>

          {/* ── Scrollable Modular Navigation Tree ── */}
          <nav
            className="sidebar-scroll flex-1 overflow-y-auto px-2 py-2 space-y-1"
            aria-label="Navigation Items"
          >
            {/* Direct to Store Dashboard */}
            <div className="mb-1.5">
              <Link
                href={`${basePath}/dashboard`}
                onClick={onNavigate}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 h-8.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition-colors border border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white",
                  collapsed ? "justify-center px-0 w-9 mx-auto" : ""
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors" strokeWidth={1.75} />
                {!collapsed && (
                  <span className="truncate">
                    {isBn ? "স্টোর ড্যাশবোর্ড" : "Store Dashboard"}
                  </span>
                )}
              </Link>
            </div>

            {/* Render Each Permitted Business Module */}
            {BUSINESS_MODULES.map((mod) => {
              if (mod.id === "home") return null; // Home is represented by the direct link above

              // Skip unauthorized modules
              if (!permittedModuleIds.has(mod.id)) return null;

              const visibleItems = mod.items.filter((it) => !resolveItemAccess(it).noPermission);
              if (visibleItems.length === 0) return null;

              const isExpanded = Boolean(expandedModules[mod.id]);
              const isModuleActive = mod.id === activeModule.id;
              const ModIcon = mod.icon;

              return (
                <div
                  key={mod.id}
                  className="rounded-lg transition-colors py-0.5"
                >
                  {/* Module Collapsible Header */}
                  {!collapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-semibold tracking-wide uppercase transition-colors outline-none",
                        isModuleActive
                          ? "text-indigo-950 dark:text-indigo-200 font-bold"
                          : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/60 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-900/60"
                      )}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <ModIcon className={cn("h-3 w-3 shrink-0", isModuleActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 dark:text-zinc-500")} strokeWidth={1.75} />
                        <span className="truncate">
                          {isBn ? mod.titleBn : mod.titleEn}
                        </span>
                      </div>
                      <span className="text-zinc-400 dark:text-zinc-500">
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" strokeWidth={2} />
                        ) : (
                          <ChevronRight className="h-3 w-3" strokeWidth={2} />
                        )}
                      </span>
                    </button>
                  ) : null}

                  {/* Module Children Items */}
                  {(isExpanded || collapsed) && (
                    <div className="space-y-0.5 mt-0.5 pl-0">
                      {visibleItems.map((item) => {
                        const access = resolveItemAccess(item);
                        return (
                          <SidebarNavItem
                            key={item.id}
                            item={item}
                            basePath={basePath}
                            collapsed={collapsed}
                            isBn={isBn}
                            isPinned={pinnedItemIds.includes(item.id)}
                            onTogglePin={togglePin}
                            onNavigate={onNavigate}
                            locked={access.locked}
                            requiredPlan={access.requiredPlan}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* ── Bottom Storage & Collapse Toggle Bar ── */}
          <div className={cn("shrink-0 border-t border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950", collapsed ? "p-1.5" : "p-2.5")}>
            {!collapsed ? (
              <div className="mb-2 rounded-lg border border-zinc-200/60 bg-zinc-50/70 p-2 dark:border-zinc-800/80 dark:bg-zinc-900/50">
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
            ) : null}

            {/* Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors outline-none",
                collapsed ? "justify-center px-0" : "px-2"
              )}
              title={collapsed ? (isBn ? "সাইডবার বড় করুন" : "Expand sidebar") : (isBn ? "সাইডবার ছোট করুন" : "Collapse sidebar")}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="text-[11.5px] font-medium">
                    {isBn ? "সাইডবার সঙ্কুচিত করুন" : "Collapse sidebar"}
                  </span>
                </>
              )}
            </button>
          </div>
        </aside>
      </SidebarContext.Provider>
    </TooltipProvider>
  );
}
