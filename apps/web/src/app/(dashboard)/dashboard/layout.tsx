import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Dashboard • Workspace",
  description: "Manage your BornoLand workspace.",
  canonicalPath: "/dashboard",
});

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
