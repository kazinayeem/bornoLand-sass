"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AdminLayoutProvider, useAdminLayout } from "@/components/admin/admin-layout-context";
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

function AdminShellInner({ children }: { children: ReactNode }) {
  const { collapsed } = useAdminLayout();

  return (
    <div className="min-h-screen bg-apple-canvas-parchment dark:bg-apple-surface-black">
      <AdminSidebar />
      <AdminMobileSidebar />
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64",
        )}
      >
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminLayoutProvider>
  );
}
