import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
