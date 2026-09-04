import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession, hasAuthCookie } from "@/lib/auth-session";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { buildPageMetadata } from "@/lib/server/page-metadata";
import { ProtectedSessionBoundary } from "@/components/auth/protected-session-boundary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Merchant Workspace | BornoLand",
  description: "Select and manage your BornoLand stores, operations, and business workspaces.",
  canonicalPath: "/workshops",
});

export default async function WorkshopsLayout({ children }: { children: ReactNode }) {
  const [session, hasPendingAuth] = await Promise.all([
    getServerSession(),
    hasAuthCookie(),
  ]);

  if (!session && !hasPendingAuth) {
    redirect("/login?redirect=%2Fworkshops");
  }

  // Employee role check: redirect employees to employee self-service workspace
  if (session?.role === "employee") {
    if (session.defaultStoreSlug) {
      redirect(`/store/${session.defaultStoreSlug}/hrm/self-service`);
    } else {
      redirect("/unauthorized");
    }
  }

  return (
    <ProtectedSessionBoundary loginPath="/login">
      <WorkspaceShell>{children}</WorkspaceShell>
    </ProtectedSessionBoundary>
  );
}
