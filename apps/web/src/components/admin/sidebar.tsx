"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Users, FileText, Settings, LogOut,
  ChevronLeft, ChevronRight, CreditCard, BarChart3, Shield,
  Palette, MessageSquare, ShoppingBag, Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { env } from "@/config/env";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/dashboard/stores", label: "Stores", icon: Store },
  { href: "/admin/dashboard/users", label: "Users", icon: Users },
  { href: "/admin/dashboard/plans", label: "Plans", icon: CreditCard },
  { href: "/admin/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard/templates", label: "Templates", icon: Palette },
  { href: "/admin/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/admin/dashboard/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/dashboard/pages", label: "Pages", icon: FileText },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "flex flex-col border-r border-zinc-200 bg-white transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
          {env.APP_NAME.slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-zinc-900">{env.APP_NAME}</span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                collapsed && "justify-center px-2"
              )}>
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {env.APP_NAME.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">Super Admin</p>
              <p className="truncate text-xs text-zinc-500">{env.isDev ? "admin@bornoland.com" : `admin@${env.NEXT_PUBLIC_ROOT_DOMAIN}`}</p>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className={cn("flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600", collapsed && "w-full")}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
