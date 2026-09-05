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
} from "react";
import {
  LayoutDashboard,
  HardDrive,
  ChevronsUpDown,
  Check,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Lock,
  Store as StoreIcon,
  Clock,
  CalendarDays,
  CheckSquare,
  Wallet,
  CreditCard,
  UserCheck,
  FileText,
  Send,
  Bell,
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
  useMemberRole,
} from "@/features/session/hooks";

import {
  BUSINESS_MODULES,
  type BusinessModule,
  type NavItem,
} from "./navigation-registry";

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
  const { data: storesData } = useGetMyStoresQuery();
  const stores = storesData?.data?.stores ?? [];
  const status = resolveStoreStatus(store);
  const domain = getStoreDisplayDomain(store.slug);

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
          "group flex w-full items-center gap-3 rounded-xl p-2 transition-all duration-150 text-left outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800/60 focus-visible:ring-2 focus-visible:ring-[#1664d9]/20 cursor-pointer",
          collapsed ? "justify-center p-1.5" : ""
        )}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Switch workspace store"
      >
        <StoreBrandMark
          store={store}
          size={collapsed ? 38 : 40}
          roundedClassName="rounded-xl shadow-2xs shrink-0"
        />

        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[18px] font-semibold text-[#181c20] dark:text-zinc-100 leading-tight">
                {store.shortName || store.name}
              </span>
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
            <span className="truncate text-[14px] text-[#727785] dark:text-zinc-400 font-mono leading-snug mt-0.5">
              {domain}
            </span>
          </div>
        )}

        {!collapsed && (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#727785] group-hover:text-[#181c20] dark:group-hover:text-zinc-200 transition-colors" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-2xl border border-[#dfe3e8] bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
            <span>Authorized Stores</span>
            <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
              {stores.length}
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 py-1">
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
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors text-left cursor-pointer",
                    isCurrent
                      ? "bg-zinc-100 font-semibold text-[#181c20] dark:bg-zinc-800 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <StoreBrandMark store={s} size={24} roundedClassName="rounded-md" />
                    <span className="truncate">{s.shortName || s.name}</span>
                  </div>
                  {isCurrent && <Check className="h-4 w-4 text-[#1664d9] dark:text-[#60a5fa] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-1.5 border-t border-[#f1f4fa] dark:border-zinc-800 pt-1.5 space-y-1">
            <Link
              href="/workshops"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <StoreIcon className="h-4 w-4 text-zinc-500" />
              <span>Merchant Workspace</span>
            </Link>
            <Link
              href="/workshops/stores/create"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors"
            >
              <Plus className="h-4 w-4 text-zinc-500" />
              <span>Create New Store</span>
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
  onNavigate,
  locked,
}: {
  item: NavItem;
  basePath: string;
  collapsed: boolean;
  isBn: boolean;
  onNavigate?: () => void;
  locked?: boolean;
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
          "relative flex flex-1 items-center gap-3.5 rounded-xl px-3.5 min-h-[44px] text-[17px] font-medium transition-all duration-150 outline-none",
          isActive
            ? "bg-zinc-100/90 text-[#181c20] font-semibold dark:bg-zinc-800/80 dark:text-white"
            : "text-[#424754] hover:bg-zinc-100/70 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100",
          collapsed ? "justify-center px-0 h-11 w-11 mx-auto rounded-xl" : "",
          locked ? "opacity-60" : ""
        )}
        aria-label={label}
      >
        {/* Subtle active left indicator bar */}
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#1664d9] dark:bg-[#60a5fa]" />
        )}

        <Icon
          strokeWidth={isActive ? 2 : 1.75}
          className={cn(
            "h-[21px] w-[21px] shrink-0 transition-colors",
            isActive
              ? "text-[#1664d9] dark:text-[#60a5fa]"
              : "text-[#727785] group-hover/item:text-[#181c20] dark:text-zinc-400 dark:group-hover/item:text-white"
          )}
        />

        {!collapsed && (
          <span className="flex-1 truncate leading-tight">{label}</span>
        )}

        {!collapsed && locked && (
          <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0 ml-1.5" />
        )}

        {!collapsed && item.comingSoon && (
          <ComingSoonBadge />
        )}
      </Link>
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={14} className="py-1.5 px-3 font-semibold shadow-md text-xs">
          <span>{label}</span>
          {item.descriptionEn && (
            <span className="block text-[11px] text-zinc-400 font-normal mt-0.5">
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
  const isBn = false;
  const basePath = `/store/${store.slug}`;
  const pathname = usePathname();

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
  const memberRole = useMemberRole();
  const isOwner = useIsStoreOwner();
  const permissionSet = usePermissions();

  const isEmployeeSelfService =
    !isOwner &&
    (memberRole === "employee" ||
      (permissionSet.has("hrm:self:read") &&
        !permissionSet.has("products:read") &&
        !permissionSet.has("hrm:manage") &&
        !permissionSet.has("orders:read")));

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
  const permittedModules = useMemo(() => {
    return BUSINESS_MODULES.filter((mod) => {
      if (mod.id === "home") return false; // Handled directly as top prominent dashboard item
      return mod.items.some((it) => !resolveItemAccess(it).noPermission);
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

  const employeeNavSections = [
    {
      title: "MY WORK",
      items: [
        {
          id: "workspace",
          href: "/hrm/self-service",
          exact: true,
          label: "My Workspace",
          icon: LayoutDashboard,
        },
        {
          id: "attendance",
          href: "/hrm/self-service/attendance",
          exact: false,
          label: "Attendance & Time",
          icon: Clock,
        },
        {
          id: "leaves",
          href: "/hrm/self-service/leaves",
          exact: false,
          label: "Leave Requests",
          icon: CalendarDays,
        },
        {
          id: "tasks",
          href: "/hrm/self-service/tasks",
          exact: false,
          label: "My Tasks",
          icon: CheckSquare,
        },
      ],
    },
    {
      title: "MY PAYROLL",
      items: [
        {
          id: "payroll",
          href: "/hrm/self-service/payroll",
          exact: false,
          label: "Payslips & Salary",
          icon: Wallet,
        },
        {
          id: "bank-account",
          href: "/hrm/self-service/bank-account",
          exact: false,
          label: "Bank Account",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "MY PROFILE",
      items: [
        {
          id: "profile",
          href: "/hrm/self-service/profile",
          exact: false,
          label: "My Profile",
          icon: UserCheck,
        },
        {
          id: "documents",
          href: "/hrm/self-service/documents",
          exact: false,
          label: "My Documents",
          icon: FileText,
        },
      ],
    },
    {
      title: "MY REQUESTS",
      items: [
        {
          id: "requests",
          href: "/hrm/self-service/requests",
          exact: false,
          label: "Requests",
          icon: Send,
        },
        {
          id: "notifications",
          href: "/hrm/self-service/notifications",
          exact: false,
          label: "Notifications",
          icon: Bell,
        },
      ],
    },
  ];

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <aside
          className={cn(
            "sticky top-0 flex h-screen flex-col border-r border-[#e2e8f0] bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 select-none",
            collapsed ? "w-[76px]" : "w-[350px]"
          )}
          role="navigation"
          aria-label={isEmployeeSelfService ? "Employee Navigation" : "Merchant Navigation"}
        >
          {/* ── 1. Top: Store Header / Workspace Switcher ── */}
          <div className={cn("shrink-0 border-b border-[#e2e8f0] dark:border-zinc-800", collapsed ? "p-2.5" : "p-3.5")}>
            <SidebarStoreSwitcher store={store} collapsed={collapsed} />
          </div>

          {/* ── 2. Scrollable Section Navigation Tree ── */}
          <nav
            className="sidebar-scroll flex-1 overflow-y-auto px-3.5 py-3 space-y-4"
            aria-label="Navigation Items"
          >
            {isEmployeeSelfService ? (
              /* ── Dedicated Employee Self-Service Navigation ── */
              <div className="space-y-4">
                {employeeNavSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    {!collapsed ? (
                      <div className="px-3.5 pt-2 pb-1 text-[11px] font-bold tracking-wider text-[#727785] uppercase dark:text-zinc-400">
                        {section.title}
                      </div>
                    ) : (
                      <div className="border-t border-[#f1f4fa] dark:border-zinc-800/80 my-2" />
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const targetUrl = `${basePath}${item.href}`;
                        const isActive = item.exact
                          ? pathname === targetUrl
                          : pathname === targetUrl || pathname.startsWith(`${targetUrl}/`);
                        const Icon = item.icon;

                        const linkContent = (
                          <Link
                            href={targetUrl}
                            onClick={onNavigate}
                            className={cn(
                              "relative flex items-center gap-3 rounded-xl px-3.5 min-h-[42px] text-[15px] font-medium transition-colors outline-none",
                              isActive
                                ? "bg-[#003399]/10 text-[#003399] font-semibold dark:bg-blue-950/40 dark:text-blue-400"
                                : "text-[#424754] hover:bg-zinc-100 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                              collapsed ? "justify-center px-0 h-11 w-11 mx-auto rounded-xl" : ""
                            )}
                            aria-label={item.label}
                          >
                            {isActive && !collapsed && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#003399] dark:bg-blue-400" />
                            )}
                            <Icon
                              strokeWidth={isActive ? 2 : 1.75}
                              className={cn(
                                "h-[20px] w-[20px] shrink-0 transition-colors",
                                isActive
                                  ? "text-[#003399] dark:text-blue-400"
                                  : "text-[#727785] group-hover:text-[#181c20] dark:text-zinc-400 dark:group-hover:text-white"
                              )}
                            />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </Link>
                        );

                        if (collapsed) {
                          return (
                            <Tooltip key={item.id}>
                              <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                              <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return <div key={item.id}>{linkContent}</div>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ── Standard Merchant & Admin Navigation Tree ── */
              <>
                {/* ── Store Dashboard Entry ── */}
                <div>
                  <Link
                    href={`${basePath}/dashboard`}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-3.5 rounded-xl px-3.5 min-h-[44px] text-[17px] font-semibold transition-all duration-150 outline-none",
                      isDashboardActive
                        ? "bg-zinc-100/90 text-[#181c20] dark:bg-zinc-800/80 dark:text-white"
                        : "text-[#424754] hover:bg-zinc-100/70 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100",
                      collapsed ? "justify-center px-0 h-11 w-11 mx-auto rounded-xl" : ""
                    )}
                    aria-label="Store Dashboard"
                  >
                    {/* Active left indicator bar */}
                    {isDashboardActive && !collapsed && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#1664d9] dark:bg-[#60a5fa]" />
                    )}

                    <LayoutDashboard
                      strokeWidth={isDashboardActive ? 2 : 1.75}
                      className={cn(
                        "h-[21px] w-[21px] shrink-0 transition-colors",
                        isDashboardActive
                          ? "text-[#1664d9] dark:text-[#60a5fa]"
                          : "text-[#727785] group-hover:text-[#181c20] dark:text-zinc-400 dark:group-hover:text-white"
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate leading-tight">
                        Store Dashboard
                      </span>
                    )}
                  </Link>
                </div>

                {/* ── All Permitted Business Sections ── */}
                {permittedModules.map((mod) => {
                  const visibleItems = mod.items.filter((it) => !resolveItemAccess(it).noPermission);
                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={mod.id} className="space-y-1">
                      {/* Section Heading */}
                      {!collapsed ? (
                        <div className="px-3.5 pt-3 pb-1 text-[13px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
                          {mod.titleEn}
                        </div>
                      ) : (
                        <div className="border-t border-[#f1f4fa] dark:border-zinc-800/80 my-2" />
                      )}

                      {/* Section Navigation Items */}
                      <div className="space-y-0.5">
                        {visibleItems.map((item) => {
                          const access = resolveItemAccess(item);
                          return (
                            <SidebarNavItem
                              key={item.id}
                              item={item}
                              basePath={basePath}
                              collapsed={collapsed}
                              isBn={isBn}
                              onNavigate={onNavigate}
                              locked={access.locked}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </nav>

          {/* ── 3. Bottom Area: Storage (for merchants) & Collapse Sidebar (Sticky) ── */}
          <div className={cn("shrink-0 border-t border-[#e2e8f0] bg-white dark:border-zinc-800 dark:bg-zinc-950", collapsed ? "p-2" : "p-3.5")}>
            {!isEmployeeSelfService && !collapsed ? (
              <div className="mb-3 rounded-xl border border-[#dfe3e8] bg-[#f8fafc] p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
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
            ) : null}

            {/* Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl min-h-[44px] text-[15px] font-semibold text-[#727785] hover:bg-zinc-100 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors outline-none cursor-pointer",
                collapsed ? "justify-center px-0 h-11 w-11 mx-auto" : "px-3.5"
              )}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="h-[21px] w-[21px] shrink-0" strokeWidth={1.75} />
              ) : (
                <>
                  <PanelLeftClose className="h-[21px] w-[21px] shrink-0" strokeWidth={1.75} />
                  <span className="leading-none">
                    Collapse sidebar
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
