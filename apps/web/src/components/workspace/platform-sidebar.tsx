"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Users,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Archive,
  ScrollText,
  BarChart3,
  Eye,
  Activity,
  Globe,
  FileText,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { toggleSidebarCollapsed, setMobileSidebarOpen } from "@/redux/slices/ui-slice";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { toast } from "sonner";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/stores", label: "Stores", icon: Store },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/activity", label: "Activity", icon: ScrollText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/account", label: "Profile & settings", icon: Settings },
  { href: "/dashboard/security", label: "Security", icon: ShieldCheck },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
];

const analyticsSubLinks = [
  { href: "/dashboard/analytics/visitors", label: "Visitors", icon: Eye },
  { href: "/dashboard/analytics/live", label: "Live Visitors", icon: Activity },
  { href: "/dashboard/analytics/sources", label: "Traffic Sources", icon: Globe },
  { href: "/dashboard/analytics/reports", label: "Reports", icon: FileText },
];

const storeNav = [
  { href: "/dashboard/stores", label: "All Stores", icon: Store, exact: true },
  { href: "/dashboard/stores/create", label: "Create Store", icon: Plus },
  { href: "/dashboard/stores/archived", label: "Archived", icon: Archive },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-caption transition-all duration-200",
        collapsed && "justify-center px-2",
        active
          ? "bg-apple-primary text-apple-on-primary"
          : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink dark:text-apple-body-muted dark:hover:bg-apple-surface-tile-3 dark:hover:text-apple-body-on-dark"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-apple-on-primary" : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80 dark:group-hover:text-apple-body-muted"
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const user = useAppSelector((s) => s.user.profile);
  const [logout] = useLogoutMutation();

  const isStoresSection = pathname.startsWith("/dashboard/stores");
  const isAnalyticsSection = pathname.startsWith("/dashboard/analytics");

  const closeMobile = () => dispatch(setMobileSidebarOpen(false));

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace(getLoginUrlForCurrentPage());
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const sidebarContent = (
    <>
      <div
        className={cn(
          "flex h-16 items-center border-b border-apple-hairline px-4 dark:border-apple-surface-tile-3",
          collapsed ? "justify-center px-2" : "gap-2.5"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-apple-primary">
          <Sparkles className="h-4 w-4 text-apple-on-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-strong text-apple-ink dark:text-apple-body-on-dark">BornoLand</p>
            <p className="text-fine-print font-semibold uppercase tracking-wider text-apple-ink-muted-48">Workspace</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className={cn(
            "hidden lg:flex h-11 w-11 items-center justify-center rounded-full text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink",
            collapsed && "lg:mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className={cn("border-b border-apple-hairline p-3 dark:border-apple-surface-tile-3", collapsed && "px-2")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className={cn("mb-2 px-3 text-fine-print font-semibold uppercase tracking-wider text-apple-ink-muted-48", collapsed && "sr-only")}>
          Workspace
        </p>
        <ul className="space-y-1">
          {mainNav.map((item) => (
            <li key={item.href}>
              <NavLink {...item} collapsed={collapsed} onNavigate={closeMobile} />
            </li>
          ))}
        </ul>

        {isStoresSection && (
          <>
            <p className={cn("mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-apple-ink-muted-48", collapsed && "sr-only")}>
              Stores
            </p>
            <ul className="space-y-1">
              {storeNav.map((item) => (
                <li key={item.href}>
                  <NavLink {...item} collapsed={collapsed} onNavigate={closeMobile} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-4">
          {collapsed ? (
            <NavLink href="/dashboard/analytics/visitors" label="Analytics" icon={BarChart3} collapsed={true} onNavigate={closeMobile} />
          ) : (
            <>
              <button
                onClick={() => {
                  if (!isAnalyticsSection) {
                    router.push("/dashboard/analytics/visitors");
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-caption transition-all",
                  isAnalyticsSection
                    ? "bg-apple-primary text-apple-on-primary"
                    : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink dark:hover:bg-apple-surface-tile-3"
                )}
              >
                <BarChart3 className={cn("h-[18px] w-[18px] shrink-0", isAnalyticsSection ? "text-apple-on-primary" : "text-apple-ink-muted-48")} />
                <span className="flex-1 text-left">Analytics</span>
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isAnalyticsSection && "rotate-180")} />
              </button>
              {isAnalyticsSection && (
                <ul className="mt-1 space-y-0.5 pl-3">
                  {analyticsSubLinks.map((link) => (
                    <li key={link.href}>
                      <NavLink {...link} collapsed={false} onNavigate={closeMobile} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </nav>

      {!collapsed && (
        <div className="border-t border-apple-hairline p-3 dark:border-apple-surface-tile-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-apple-canvas-parchment p-3 dark:bg-apple-surface-tile-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-apple-primary text-caption-strong text-apple-on-primary">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-caption-strong text-apple-ink dark:text-apple-body-on-dark">{user?.name ?? "User"}</p>
              <p className="truncate text-fine-print text-apple-ink-muted-48">{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-caption text-apple-ink-muted-48 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-apple-surface-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-apple-hairline bg-apple-canvas/95 backdrop-blur-xl transition-all duration-300 dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2/95",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
