"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Store,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  Wallet,
  Globe,
  MoreHorizontal,
  LayoutTemplate,
  Package,
  ShoppingCart,
  ScrollText,
  FileText,
} from "lucide-react";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";
import { toast } from "sonner";

const primaryNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
  { href: "/admin/dashboard/stores", label: "Stores", icon: Store },
  { href: "/admin/dashboard/subscriptions", label: "Subscriptions", icon: Layers },
  { href: "/admin/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/dashboard/plans", label: "Plans", icon: Sparkles },
  { href: "/admin/dashboard/payments", label: "Payments & Review", icon: Wallet },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard/platform", label: "Platform", icon: Globe },
  { href: "/admin/dashboard/audit-center", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

const secondaryNav = [
  { href: "/admin/dashboard/templates", label: "Themes", icon: LayoutTemplate },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/orders", label: "Orders", icon: ShoppingCart },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-xl"
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-zinc-100 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed ? (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-zinc-900">BornoLand</span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Super Admin</p>
            </div>
          </Link>
        ) : (
          <Link href="/admin/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0",
                      active ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className="mb-1 flex w-full items-center gap-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              More
            </button>
            {moreOpen && (
              <ul className="space-y-0.5">
                {secondaryNav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                          active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0 text-zinc-400" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </nav>

      <div className={cn("border-t border-zinc-100 p-3", collapsed && "flex flex-col items-center gap-2")}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
              SA
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">Super Admin</p>
              <p className="truncate text-xs text-zinc-500">Subscription control</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={async () => { try { await logout().unwrap(); router.replace(getLoginUrlForCurrentPage("/admin/login")); } catch { toast.error("Failed to sign out"); } }}
          className={cn(
            "flex items-center gap-2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600",
            collapsed ? "w-full justify-center" : "w-full"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
