"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Building2, CreditCard, Receipt, LayoutTemplate,
  BarChart3, Settings, HelpCircle, Activity, ChevronLeft, ChevronRight,
  LogOut, Sparkles
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
  { href: "/admin/dashboard/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/dashboard/billing", label: "Billing", icon: Receipt },
  { href: "/admin/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard/support", label: "Support", icon: HelpCircle },
  { href: "/admin/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-200 bg-white",
        "shadow-sm"
      )}
    >
      <div className={cn("flex h-16 items-center border-b border-zinc-100 px-4", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900">BornoLand</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                  <Link
                    href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-blue-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("border-t border-zinc-100 p-3", collapsed && "flex flex-col items-center gap-3")}>
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">Super Admin</p>
              <p className="truncate text-xs text-zinc-500">admin@bornoland.com</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600",
            collapsed && "w-full"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={() => router.push("/admin/login")}
          className={cn(
            "flex items-center gap-2 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600",
            collapsed ? "justify-center w-full" : "w-full"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
