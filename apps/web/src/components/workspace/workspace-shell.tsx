"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/redux";
import { PlatformSidebar } from "@/components/workspace/platform-sidebar";
import { WorkspaceNavbar } from "@/components/workspace/workspace-navbar";

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.06),transparent_20%),linear-gradient(180deg,#ffffff_0%,#f6f8fc_48%,#eef2ff_100%)]">
      <PlatformSidebar />
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <WorkspaceNavbar />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
