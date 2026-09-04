"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import {
  UserCheck,
  Clock,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Store } from "@/redux/api/store-api";
import { StoreBrandMark } from "@/components/store-dashboard/store-brand-mark";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/providers/language-provider";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { toast } from "sonner";

/* ── Sidebar Collapse Context ─────────────────────────────────── */

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useEmployeeSidebar() {
  return useContext(SidebarContext);
}

/* ── Employee Nav Items ─────────────────────────────────────── */

type EmployeeNavItem = {
  id: string;
  href: string;
  labelEn: string;
  labelBn: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
};

const EMPLOYEE_NAV_ITEMS: EmployeeNavItem[] = [
  {
    id: "self-service",
    href: "/hrm/self-service",
    labelEn: "Self-Service Portal",
    labelBn: "সেলফ-সার্ভিস পোর্টাল",
    icon: UserCheck,
    exact: true,
  },
  {
    id: "attendance",
    href: "/hrm/self-service",
    labelEn: "Attendance & Time",
    labelBn: "হাজিরা ও সময়",
    icon: Clock,
  },
  {
    id: "leaves",
    href: "/hrm/self-service",
    labelEn: "Leave Requests",
    labelBn: "ছুটির আবেদন",
    icon: CalendarCheck,
  },
  {
    id: "payslips",
    href: "/hrm/self-service",
    labelEn: "Payslips & Salary",
    labelBn: "পে-স্লিপ ও বেতন",
    icon: Wallet,
  },
  {
    id: "profile",
    href: "/hrm/self-service",
    labelEn: "My Profile",
    labelBn: "আমার প্রোফাইল",
    icon: ShieldCheck,
  },
];

/* ── Individual Nav Item Row ───────────────────────────────────── */

function EmployeeNavItemRow({
  item,
  basePath,
  collapsed,
  isBn,
  onNavigate,
}: {
  item: EmployeeNavItem;
  basePath: string;
  collapsed: boolean;
  isBn: boolean;
  onNavigate?: () => void;
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
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-2.5 rounded-lg px-2.5 h-9 text-xs font-medium transition-all duration-150 outline-none",
        isActive
          ? "bg-zinc-100/90 text-zinc-950 font-semibold dark:bg-zinc-800/80 dark:text-white"
          : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100",
        collapsed ? "justify-center px-0 h-9 w-9 mx-auto rounded-lg" : ""
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
            : "text-zinc-500 dark:text-zinc-400"
        )}
      />
      {!collapsed && <span className="flex-1 truncate text-[12.5px] leading-none">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="py-1 px-2.5 font-medium shadow-md text-xs">
          <span>{label}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

/* ── Main Employee Sidebar Component ───────────────────────────── */

export function EmployeeSidebar({
  store,
  onNavigate,
}: {
  store: Store;
  onNavigate?: () => void;
}) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const basePath = `/store/${store.slug}`;
  const [logout] = useLogoutMutation();

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

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      window.location.replace("/login");
    } catch {
      toast.error(isBn ? "লগআউট করা সম্ভব হয়নি" : "Failed to sign out");
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <aside
          className={cn(
            "sticky top-0 flex h-screen flex-col border-r border-zinc-200/80 bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 select-none",
            collapsed ? "w-[68px]" : "w-[268px]"
          )}
          role="navigation"
          aria-label="Employee Navigation"
        >
          {/* ── Top: Store Branding ── */}
          <div className={cn("shrink-0 border-b border-zinc-200/80 dark:border-zinc-800", collapsed ? "p-2" : "p-2.5")}>
            <div className={cn("flex items-center gap-2.5 p-1.5", collapsed && "justify-center p-1")}>
              <StoreBrandMark
                store={store}
                size={collapsed ? 34 : 32}
                roundedClassName="rounded-lg shadow-2xs shrink-0"
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {store.shortName || store.name}
                  </span>
                  <span className="truncate text-[10.5px] text-zinc-500 dark:text-zinc-400">
                    {isBn ? "কর্মী পোর্টাল" : "Employee Workspace"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Employee Navigation ── */}
          <nav
            className="sidebar-scroll flex-1 overflow-y-auto px-2 py-2 space-y-1"
            aria-label="Employee Navigation"
          >
            {/* Quick link to Store Dashboard */}
            <div className="mb-2">
              <Link
                href={`${basePath}/hrm/self-service`}
                onClick={onNavigate}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 h-8.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950 transition-colors border border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white",
                  collapsed ? "justify-center px-0 w-9 mx-auto" : ""
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-zinc-500 group-hover:text-zinc-800 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors" strokeWidth={1.75} />
                {!collapsed && (
                  <span className="truncate">
                    {isBn ? "আমার ওয়ার্কস্পেস" : "My Workspace"}
                  </span>
                )}
              </Link>
            </div>

            {/* Section: My Work */}
            {!collapsed && (
              <div className="px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {isBn ? "আমার কাজ" : "My Work"}
              </div>
            )}
            <div className="space-y-0.5">
              {EMPLOYEE_NAV_ITEMS.slice(0, 3).map((item) => (
                <EmployeeNavItemRow
                  key={item.id}
                  item={item}
                  basePath={basePath}
                  collapsed={collapsed}
                  isBn={isBn}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Section: My Payroll */}
            {!collapsed && (
              <div className="px-2 py-1 mt-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {isBn ? "আমার বেতন" : "My Payroll"}
              </div>
            )}
            <div className="space-y-0.5">
              {EMPLOYEE_NAV_ITEMS.slice(3, 4).map((item) => (
                <EmployeeNavItemRow
                  key={item.id}
                  item={item}
                  basePath={basePath}
                  collapsed={collapsed}
                  isBn={isBn}
                  onNavigate={onNavigate}
                />
              ))}
            </div>

            {/* Section: My Account */}
            {!collapsed && (
              <div className="px-2 py-1 mt-2.5 text-[10.5px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {isBn ? "আমার অ্যাকাউন্ট" : "My Account"}
              </div>
            )}
            <div className="space-y-0.5">
              {EMPLOYEE_NAV_ITEMS.slice(4, 5).map((item) => (
                <EmployeeNavItemRow
                  key={item.id}
                  item={item}
                  basePath={basePath}
                  collapsed={collapsed}
                  isBn={isBn}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </nav>

          {/* ── Bottom: Logout & Collapse Toggle ── */}
          <div className={cn("shrink-0 border-t border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950", collapsed ? "p-1.5" : "p-2.5")}>
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors outline-none mb-1.5",
                collapsed ? "justify-center px-0" : "px-2"
              )}
              title={isBn ? "লগআউট" : "Sign out"}
              aria-label={isBn ? "লগআউট" : "Sign out"}
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>{isBn ? "লগআউট" : "Sign out"}</span>}
            </button>

            {/* Collapse / Expand Toggle */}
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
