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
        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all outline-none",
        isActive
          ? "bg-indigo-50/90 text-indigo-950 font-bold border-l-2 border-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-400"
          : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
        collapsed ? "justify-center px-0 h-9 w-9 mx-auto rounded-lg" : ""
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-zinc-500 dark:text-zinc-400"
        )}
      />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="py-1 px-2.5 font-medium shadow-md">
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
            collapsed ? "w-[68px]" : "w-[270px]"
          )}
          role="navigation"
          aria-label="Employee Self-Service Navigation"
        >
          {/* ── Top: Store Branding ── */}
          <div className={cn("shrink-0 border-b border-zinc-200/80 dark:border-zinc-800", collapsed ? "p-2" : "p-3")}>
            <div className="flex items-center gap-2.5">
              <StoreBrandMark
                store={store}
                size={collapsed ? 36 : 34}
                roundedClassName="rounded-lg shadow-xs shrink-0"
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-bold text-zinc-900 dark:text-white">
                    {store.shortName || store.name}
                  </span>
                  <span className="truncate text-[10px] text-zinc-500">
                    {isBn ? "কর্মী পোর্টাল" : "Employee Portal"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Employee Navigation ── */}
          <nav
            className="sidebar-scroll flex-1 overflow-y-auto px-2 py-3 space-y-1"
            aria-label="Employee Navigation"
          >
            {/* Quick link to Store Dashboard */}
            <div className="mb-3">
              <Link
                href={`${basePath}/hrm/self-service`}
                onClick={onNavigate}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-2.5 h-8 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-colors border border-zinc-200/70 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
                  collapsed ? "justify-center px-0 w-9 mx-auto" : ""
                )}
              >
                <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                {!collapsed && (
                  <span className="truncate">
                    {isBn ? "আমার ওয়ার্কস্পেস" : "My Workspace"}
                  </span>
                )}
              </Link>
            </div>

            {/* Section: My Work */}
            {!collapsed && (
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
              <div className="px-2.5 py-1 mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
              <div className="px-2.5 py-1 mt-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
          <div className={cn("shrink-0 border-t border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950", collapsed ? "p-2" : "p-3")}>
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors outline-none mb-2",
                collapsed ? "justify-center px-0" : "px-2"
              )}
              title={isBn ? "লগআউট" : "Sign out"}
            >
              <LogOut className="h-4 w-4 shrink-0" />
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
            >
              {collapsed ? (
                <PanelLeft className="h-4 w-4 shrink-0" />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium">
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
