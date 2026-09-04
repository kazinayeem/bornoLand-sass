"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useState,
  useCallback,
  createContext,
  useContext,
  useEffect,
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
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
};

const EMPLOYEE_NAV_ITEMS: EmployeeNavItem[] = [
  {
    id: "self-service",
    href: "/hrm/self-service",
    label: "Self-Service Portal",
    icon: UserCheck,
    exact: true,
  },
  {
    id: "attendance",
    href: "/hrm/self-service",
    label: "Attendance & Time",
    icon: Clock,
  },
  {
    id: "leaves",
    href: "/hrm/self-service",
    label: "Leave Requests",
    icon: CalendarCheck,
  },
  {
    id: "payslips",
    href: "/hrm/self-service",
    label: "Payslips & Salary",
    icon: Wallet,
  },
  {
    id: "profile",
    href: "/hrm/self-service",
    label: "My Profile",
    icon: ShieldCheck,
  },
];

/* ── Individual Nav Item Row ───────────────────────────────────── */

function EmployeeNavItemRow({
  item,
  basePath,
  collapsed,
  onNavigate,
}: {
  item: EmployeeNavItem;
  basePath: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const href = `${basePath}${item.href}`;
  const isExact = item.exact;
  const isActive = isExact
    ? pathname === href
    : pathname.startsWith(href.split("?")[0]);

  const Icon = item.icon;
  const label = item.label;

  const content = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3.5 rounded-xl px-3.5 min-h-[44px] text-[17px] font-medium transition-all duration-150 outline-none",
        isActive
          ? "bg-zinc-100/90 text-[#181c20] font-semibold dark:bg-zinc-800/80 dark:text-white"
          : "text-[#424754] hover:bg-zinc-100/70 hover:text-[#181c20] dark:text-zinc-400 dark:hover:bg-zinc-900/80 dark:hover:text-zinc-100",
        collapsed ? "justify-center px-0 h-11 w-11 mx-auto rounded-xl" : ""
      )}
      aria-label={label}
    >
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#1664d9] dark:bg-[#60a5fa]" />
      )}

      <Icon
        strokeWidth={isActive ? 2 : 1.75}
        className={cn(
          "h-[21px] w-[21px] shrink-0 transition-colors",
          isActive
            ? "text-[#1664d9] dark:text-[#60a5fa]"
            : "text-[#727785] hover:text-[#181c20] dark:text-zinc-400 dark:hover:text-white"
        )}
      />

      {!collapsed && (
        <span className="truncate leading-tight">{label}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={14} className="py-1.5 px-3 font-semibold shadow-md text-xs">
          <span>{label}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

/* ── Employee Sidebar Component ───────────────────────────────── */

export function EmployeeSidebar({
  store,
  onNavigate,
}: {
  store: Store;
  onNavigate?: () => void;
}) {
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
      toast.error("Failed to sign out");
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
        <aside
          className={cn(
            "sticky top-0 flex h-screen flex-col border-r border-[#e2e8f0] bg-white transition-[width] duration-200 ease-in-out dark:border-zinc-800 dark:bg-zinc-950 select-none",
            collapsed ? "w-[76px]" : "w-[350px]"
          )}
          role="navigation"
          aria-label="Employee Navigation"
        >
          {/* ── Top: Store Branding ── */}
          <div className={cn("shrink-0 border-b border-[#e2e8f0] dark:border-zinc-800", collapsed ? "p-2.5" : "p-3.5")}>
            <div className={cn("flex items-center gap-3 p-1", collapsed && "justify-center p-0.5")}>
              <StoreBrandMark
                store={store}
                size={collapsed ? 38 : 40}
                roundedClassName="rounded-xl shadow-2xs shrink-0"
              />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[18px] font-semibold text-[#181c20] dark:text-zinc-100 leading-tight">
                    {store.shortName || store.name}
                  </span>
                  <span className="truncate text-[13.5px] text-[#727785] dark:text-zinc-400">
                    Employee Workspace
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Employee Navigation ── */}
          <nav
            className="sidebar-scroll flex-1 overflow-y-auto px-3.5 py-3 space-y-4"
            aria-label="Employee Navigation"
          >
            {/* Quick link to Self-Service Portal */}
            <div>
              <Link
                href={`${basePath}/hrm/self-service`}
                onClick={onNavigate}
                className={cn(
                  "relative flex items-center gap-3.5 rounded-xl px-3.5 min-h-[44px] text-[17px] font-semibold transition-all duration-150 outline-none",
                  "bg-zinc-100/90 text-[#181c20] dark:bg-zinc-800/80 dark:text-white",
                  collapsed ? "justify-center px-0 h-11 w-11 mx-auto rounded-xl" : ""
                )}
              >
                <LayoutDashboard className="h-[21px] w-[21px] shrink-0 text-[#1664d9] dark:text-[#60a5fa]" strokeWidth={2} />
                {!collapsed && (
                  <span className="truncate leading-tight">
                    My Workspace
                  </span>
                )}
              </Link>
            </div>

            {/* Section: My Work */}
            <div className="space-y-1">
              {!collapsed ? (
                <div className="px-3.5 pt-3 pb-1 text-[13px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
                  My Work
                </div>
              ) : (
                <div className="border-t border-[#f1f4fa] dark:border-zinc-800/80 my-2" />
              )}
              <div className="space-y-0.5">
                {EMPLOYEE_NAV_ITEMS.slice(0, 3).map((item) => (
                  <EmployeeNavItemRow
                    key={item.id}
                    item={item}
                    basePath={basePath}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>

            {/* Section: My Payroll */}
            <div className="space-y-1">
              {!collapsed ? (
                <div className="px-3.5 pt-3 pb-1 text-[13px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
                  My Payroll
                </div>
              ) : (
                <div className="border-t border-[#f1f4fa] dark:border-zinc-800/80 my-2" />
              )}
              <div className="space-y-0.5">
                {EMPLOYEE_NAV_ITEMS.slice(3, 4).map((item) => (
                  <EmployeeNavItemRow
                    key={item.id}
                    item={item}
                    basePath={basePath}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>

            {/* Section: My Account */}
            <div className="space-y-1">
              {!collapsed ? (
                <div className="px-3.5 pt-3 pb-1 text-[13px] font-semibold uppercase tracking-wider text-[#727785] dark:text-zinc-400">
                  My Account
                </div>
              ) : (
                <div className="border-t border-[#f1f4fa] dark:border-zinc-800/80 my-2" />
              )}
              <div className="space-y-0.5">
                {EMPLOYEE_NAV_ITEMS.slice(4, 5).map((item) => (
                  <EmployeeNavItemRow
                    key={item.id}
                    item={item}
                    basePath={basePath}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          </nav>

          {/* ── Bottom: Logout & Collapse Toggle ── */}
          <div className={cn("shrink-0 border-t border-[#e2e8f0] bg-white dark:border-zinc-800 dark:bg-zinc-950", collapsed ? "p-2" : "p-3.5")}>
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl min-h-[44px] px-3.5 text-[15px] font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors outline-none mb-2 cursor-pointer",
                collapsed ? "justify-center px-0 h-11 w-11 mx-auto" : ""
              )}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-[21px] w-[21px] shrink-0" strokeWidth={1.75} />
              {!collapsed && <span>Sign out</span>}
            </button>

            {/* Collapse / Expand Toggle */}
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
