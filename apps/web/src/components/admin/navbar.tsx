"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell, Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/users": "Users",
  "/admin/dashboard/tenants": "Tenants",
  "/admin/dashboard/subscriptions": "Subscriptions",
  "/admin/dashboard/billing": "Billing",
  "/admin/dashboard/templates": "Templates",
  "/admin/dashboard/analytics": "Analytics",
  "/admin/dashboard/support": "Support",
  "/admin/dashboard/activity": "Activity Logs",
  "/admin/dashboard/settings": "Settings"
};

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const currentPage = routeLabels[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">{currentPage}</h1>
          <p className="text-xs text-zinc-500">Super Admin / {currentPage}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn("relative hidden sm:block", showSearch && "sm:hidden")}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700">
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
          SA
        </div>
      </div>
    </header>
  );
}
