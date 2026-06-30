"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { PlatformSidebar } from "@/components/workspace/platform-sidebar";
import { WorkspaceNavbar } from "@/components/workspace/workspace-navbar";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <PlatformSidebar />
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <WorkspaceNavbar />
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
