"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLogoutMutation } from "@/redux/api/auth-api";
import { getLoginUrlForCurrentPage } from "@/lib/auth-redirect-client";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { useAdminLayout } from "@/components/admin/admin-layout-context";

export function AdminSidebar() {
  const { collapsed, setCollapsed } = useAdminLayout();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.replace(getLoginUrlForCurrentPage("/admin/login"));
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-apple-hairline bg-apple-canvas/95 backdrop-blur-xl lg:flex"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-apple-divider-soft px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? (
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-apple-ink">BornoLand</span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-apple-ink-muted-48">
                Platform
              </p>
            </div>
          </Link>
        ) : (
          <Link href="/admin/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </Link>
        )}
      </div>

      <AdminSidebarNav collapsed={collapsed} />

      <div className={cn("shrink-0 border-t border-apple-divider-soft p-3", collapsed && "flex flex-col items-center")}>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="mb-2 flex w-full items-center justify-center rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className={cn(
            "flex items-center gap-2 rounded-lg p-2 text-apple-ink-muted-48 transition-colors hover:bg-red-50 hover:text-red-600",
            collapsed ? "w-full justify-center" : "w-full px-3",
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Sign out</span>}
        </button>
      </div>
    </motion.aside>
  );
}

export function AdminMobileSidebar() {
  const { mobileOpen, setMobileOpen } = useAdminLayout();

  return (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-apple-surface-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 flex h-full w-72 flex-col border-r border-apple-hairline bg-apple-canvas dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-apple-hairline px-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-primary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-body-strong text-apple-ink">BornoLand Platform</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-apple-surface-chip/64 text-apple-ink-muted-48"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AdminSidebarNav onNavigate={() => setMobileOpen(false)} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
