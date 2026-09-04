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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { toggleSidebarCollapsed, setMobileSidebarOpen } from "@/redux/slices/ui-slice";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { useLanguage } from "@/providers/language-provider";
import { toast } from "sonner";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";

import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact?: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const item = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-2.5 h-10 min-h-[40px] text-[13px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/20",
        collapsed && "justify-center px-0",
        active
          ? "bg-zinc-100 text-zinc-950 font-medium dark:bg-white/[0.08] dark:text-white"
          : "text-zinc-600 hover:bg-zinc-100/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.05] dark:hover:text-zinc-100"
      )}
      aria-label={label}
    >
      {/* Active indicator strip */}
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-zinc-900 dark:bg-white" />
      )}
      <Icon
        strokeWidth={1.75}
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
          active
            ? "text-zinc-950 dark:text-white"
            : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{item}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} className="py-1 px-2.5 shadow-md">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return item;
}

function NavSection({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="mx-3 my-2.5 h-px bg-zinc-200/60 dark:bg-zinc-800" />;
  return (
    <p className="px-2.5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
      {label}
    </p>
  );
}

export function PlatformSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { language, t } = useLanguage();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const user = useAppSelector((s) => s.user.profile);
  const [logout] = useLogoutMutation();

  const isStoresSection =
    pathname.startsWith("/dashboard/stores") ||
    pathname.startsWith("/workshops") ||
    pathname === "/workshops";
  const isAnalyticsSection = pathname.startsWith("/dashboard/analytics");

  const closeMobile = () => dispatch(setMobileSidebarOpen(false));

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // After logout, always go to /login without redirect parameter
      window.location.replace("/login");
    } catch {
      toast.error(language === "bn" ? "সাইন আউট করতে ব্যর্থ হয়েছে" : "Failed to sign out");
    }
  };

  const mainNav = [
    { href: "/dashboard", label: t.navigation.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/workshops", label: t.navigation.stores, icon: Store },
    { href: "/dashboard/plans", label: "Plans & Features", icon: CreditCard },
    { href: "/dashboard/billing", label: t.navigation.billing, icon: CreditCard },
    { href: "/dashboard/team", label: t.navigation.team, icon: Users },
    { href: "/dashboard/activity", label: t.navigation.activity, icon: ScrollText },
    { href: "/dashboard/notifications", label: t.navigation.notifications, icon: Bell },
  ];

  const accountNav = [
    { href: "/dashboard/account", label: t.navigation.settings, icon: Settings },
    { href: "/dashboard/security", label: t.navigation.security, icon: ShieldCheck },
    { href: "/dashboard/help", label: t.navigation.help, icon: HelpCircle },
  ];

  const analyticsSubLinks = [
    { href: "/dashboard/analytics/visitors", label: t.navigation.visitors, icon: Eye },
    { href: "/dashboard/analytics/live", label: t.navigation.liveVisitors, icon: Activity },
    { href: "/dashboard/analytics/sources", label: t.navigation.trafficSources, icon: Globe },
    { href: "/dashboard/analytics/reports", label: t.navigation.reports, icon: FileText },
  ];

  const storeNav = [
    { href: "/workshops", label: t.navigation.allStores, icon: Store, exact: true },
    { href: "/dashboard/stores/create", label: t.navigation.createStore, icon: Plus },
    { href: "/dashboard/stores/archived", label: t.navigation.archived, icon: Archive },
  ];

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? (language === "bn" ? "ইউ" : "U");

  const sidebarContent = (
    <>
      {/* ── Brand / Logo ─────────────────────────────────────── */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-apple-hairline/60 px-4 dark:border-white/[0.06]",
          collapsed ? "justify-center px-2" : "gap-2.5"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] bg-apple-ink dark:bg-white">
          <Sparkles className="h-3.5 w-3.5 text-white dark:text-apple-ink" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-apple-ink dark:text-white">
              BornoLand
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className={cn(
            "hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-apple-ink-muted-48 transition-colors hover:bg-apple-ink/[0.05] hover:text-apple-ink dark:hover:bg-white/10 dark:hover:text-white",
            collapsed && "lg:mx-auto mt-0"
          )}
          aria-label={collapsed ? t.navigation.expandSidebar : t.navigation.collapseSidebar}
        >
          {collapsed ? (
            <PanelLeft className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ── Workspace Switcher ───────────────────────────────── */}
      <div className={cn("border-b border-apple-hairline/60 p-2.5 dark:border-white/[0.06]", collapsed && "px-2")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <NavSection label={t.navigation.workspace} collapsed={collapsed} />
        <ul className="space-y-0.5">
          {mainNav.map((item) => (
            <li key={item.href}>
              <NavItem {...item} collapsed={collapsed} onNavigate={closeMobile} />
            </li>
          ))}
        </ul>

        {/* Analytics expandable sub-nav */}
        <div className="mt-0.5">
          {collapsed ? (
            <NavItem
              href="/dashboard/analytics/visitors"
              label={t.navigation.analytics}
              icon={BarChart3}
              collapsed={true}
              onNavigate={closeMobile}
            />
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!isAnalyticsSection) router.push("/dashboard/analytics/visitors");
                }}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-150",
                  isAnalyticsSection
                    ? "bg-apple-ink/[0.07] text-apple-ink dark:bg-white/10 dark:text-white"
                    : "text-apple-ink-muted-48 hover:bg-apple-ink/[0.04] hover:text-apple-ink dark:text-apple-body-muted dark:hover:bg-white/8 dark:hover:text-white"
                )}
              >
                {isAnalyticsSection && (
                  <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-apple-ink dark:bg-white" />
                )}
                <BarChart3 className={cn("h-4 w-4 shrink-0", isAnalyticsSection ? "text-apple-ink dark:text-white" : "text-apple-ink-muted-48 group-hover:text-apple-ink-muted-80")} />
                <span className="flex-1 text-left">{t.navigation.analytics}</span>
                <ChevronDown className={cn("h-3 w-3 text-apple-ink-muted-48 transition-transform", isAnalyticsSection && "rotate-180")} />
              </button>
              {isAnalyticsSection && (
                <ul className="mt-0.5 space-y-0.5 pl-4 border-l border-apple-hairline/60 ml-4">
                  {analyticsSubLinks.map((link) => (
                    <li key={link.href}>
                      <NavItem {...link} collapsed={false} onNavigate={closeMobile} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Stores sub-nav */}
        {isStoresSection && !collapsed && (
          <>
            <NavSection label={t.navigation.store} collapsed={collapsed} />
            <ul className="space-y-0.5">
              {storeNav.map((item) => (
                <li key={item.href}>
                  <NavItem {...item} collapsed={collapsed} onNavigate={closeMobile} />
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Account nav */}
        <NavSection label={t.navigation.account} collapsed={collapsed} />
        <ul className="space-y-0.5">
          {accountNav.map((item) => (
            <li key={item.href}>
              <NavItem {...item} collapsed={collapsed} onNavigate={closeMobile} />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── User Section ─────────────────────────────────────── */}
      <div className={cn("border-t border-apple-hairline/60 p-2.5 dark:border-white/[0.06]", collapsed && "px-2")}>
        {collapsed ? (
          <button
            type="button"
            onClick={handleLogout}
            title={t.navigation.signOut}
            className="flex w-full items-center justify-center rounded-md p-2 text-apple-ink-muted-48 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-apple-ink text-[11px] font-semibold text-white dark:bg-white dark:text-apple-ink">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-apple-ink dark:text-white">
                {user?.name ?? (language === "bn" ? "ইউজার" : "User")}
              </p>
              <p className="truncate text-[11px] text-apple-ink-muted-48 dark:text-apple-body-muted">
                {user?.email ?? ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title={t.navigation.signOut}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-apple-ink-muted-48 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <TooltipProvider delayDuration={120}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-apple-surface-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-label={t.navigation.collapseSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-apple-hairline/60 bg-apple-canvas/98 backdrop-blur-xl transition-all duration-300 dark:border-white/[0.06] dark:bg-apple-surface-tile-2/98",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </TooltipProvider>
  );
}

