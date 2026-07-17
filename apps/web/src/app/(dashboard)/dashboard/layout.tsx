import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession, hasAuthCookie } from "@/lib/auth-session";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Dashboard • Workspace",
  description: "Manage your BornoLand workspace.",
  canonicalPath: "/dashboard",
});

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [session, hasPendingAuth] = await Promise.all([getServerSession(), hasAuthCookie()]);
  if (!session && !hasPendingAuth) redirect("/login");
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
