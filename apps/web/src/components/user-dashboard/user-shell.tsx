"use client";

import type { ReactNode } from "react";
import { UserSidebar } from "@/components/user-dashboard/sidebar";
import { UserNavbar } from "@/components/user-dashboard/navbar";

export function UserShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      <UserSidebar />
      <div className="pl-64">
        <UserNavbar />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
