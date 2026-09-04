import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession, hasAuthCookie } from "@/lib/auth-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { buildPageMetadata } from "@/lib/server/page-metadata";
import { ProtectedSessionBoundary } from "@/components/auth/protected-session-boundary";
import { getUserDefaultStoreSlug } from "@/lib/server/store-lookup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Platform Dashboard",
  description: "Manage your BornoLand platform, stores, and business operations.",
  canonicalPath: "/dashboard",
});

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [session, hasPendingAuth, headerList] = await Promise.all([
    getServerSession(),
    hasAuthCookie(),
    headers(),
  ]);
  if (!session && !hasPendingAuth) redirect("/login");

  const pathname = headerList.get("x-pathname") || "";
  const isSuperAdmin = session?.role === "super_admin";
  const isMerchant = session?.role === "admin" || session?.role === "owner" || session?.role === "editor" || session?.role === "viewer";

  // If this is the store creation page, allow any authenticated user (e.g. merchant onboarding)
  if (pathname.startsWith("/dashboard/stores/create") || pathname === "/dashboard/create-store") {
    return (
      <ProtectedSessionBoundary loginPath="/login">
        <div className="min-h-screen bg-apple-canvas-parchment dark:bg-zinc-950 p-4 md:p-8">
          {children}
        </div>
      </ProtectedSessionBoundary>
    );
  }

  // Non-super-admin users:
  if (session && !isSuperAdmin) {
    const storeSlug = session.defaultStoreSlug || (await getUserDefaultStoreSlug());

    // Root /dashboard is the platform overview reserved for Super Admin; merchants redirect to /workshops, employees to self-service
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      if (session.role === "employee") {
        if (session.defaultStoreSlug) {
          redirect(`/store/${session.defaultStoreSlug}/hrm/self-service`);
        }
        redirect("/unauthorized");
      }
      if (isMerchant) {
        redirect("/workshops");
      }
      if (storeSlug) {
        redirect(`/store/${storeSlug}/dashboard`);
      }
      redirect("/workshops");
    }

    if (session.role === "employee") {
      if (session.defaultStoreSlug) {
        redirect(`/store/${session.defaultStoreSlug}/hrm/self-service`);
      }
      redirect("/unauthorized");
    }

    // Merchants on allowed /dashboard/* subroutes (stores, billing, account, notifications, etc.)
    return (
      <ProtectedSessionBoundary loginPath="/login">
        <WorkspaceShell>{children}</WorkspaceShell>
      </ProtectedSessionBoundary>
    );
  }

  // Super Admin: render platform administration shell
  return (
    <ProtectedSessionBoundary requiredRole="super_admin" loginPath="/login">
      <AdminShell>{children}</AdminShell>
    </ProtectedSessionBoundary>
  );
}
