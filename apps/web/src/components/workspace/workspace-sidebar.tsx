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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { toggleSidebarCollapsed, setMobileSidebarOpen } from "@/redux/slices/ui-slice";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { toast } from "sonner";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/stores", label: "Stores", icon: Store },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/account", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
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
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        collapsed && "justify-center px-2",
        active
          ? "bg-zinc-900 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          active ? "text-white" : "text-zinc-400 group-hover:text-zinc-600"
        )}
      />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const mobileOpen = useAppSelector((s) => s.ui.mobileSidebarOpen);
  const user = useAppSelector((s) => s.user.profile);
  const [logout] = useLogoutMutation();

  const isStoresSection = pathname.startsWith("/dashboard/stores");

  const closeMobile = () => dispatch(setMobileSidebarOpen(false));

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push("/login");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const sidebarContent = (
    <>
      <div
        className={cn(
          "flex h-16 items-center border-b border-zinc-200/80 px-4",
          collapsed ? "justify-center px-2" : "gap-2.5"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold tracking-tight text-zinc-900">BornoLand</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Workspace</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className={cn(
            "hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700",
            collapsed && "lg:mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <div className={cn("border-b border-zinc-200/80 p-3", collapsed && "px-2")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className={cn("mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400", collapsed && "sr-only")}>
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
            <p className={cn("mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400", collapsed && "sr-only")}>
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
      </nav>

      {!collapsed && (
        <div className="border-t border-zinc-200/80 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {user?.name?.split(" ").map((n) => n[0]).join("") ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{user?.name ?? "User"}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
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
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
