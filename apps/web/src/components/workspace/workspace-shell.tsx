"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { PlatformSidebar } from "@/components/workspace/platform-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-apple-canvas-parchment dark:bg-apple-surface-black">
      <PlatformSidebar />
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden transition-all duration-300 ease-apple",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64",
        )}
      >
        <DashboardHeader mode="workspace" />
        <main className="content-scroll flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
