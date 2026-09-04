import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession, hasAuthCookie } from "@/lib/auth-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { buildPageMetadata } from "@/lib/server/page-metadata";
import { ProtectedSessionBoundary } from "@/components/auth/protected-session-boundary";
import { getUserDefaultStoreSlug } from "@/lib/server/store-lookup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Platform Dashboard • Super Admin",
  description: "Manage the BornoLand SaaS platform as Super Admin.",
  canonicalPath: "/dashboard",
});

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [session, hasPendingAuth] = await Promise.all([getServerSession(), hasAuthCookie()]);
  if (!session && !hasPendingAuth) redirect("/login");

  // If authenticated user is NOT super admin, redirect to their own store dashboard
  if (session && session.role !== "super_admin") {
    const storeSlug = session.defaultStoreSlug || (await getUserDefaultStoreSlug());
    if (storeSlug) {
      redirect(`/store/${storeSlug}/dashboard`);
    } else {
      redirect("/dashboard/stores/create");
    }
  }

  // Super Admin: render platform administration shell
  return (
    <ProtectedSessionBoundary requiredRole="super_admin" loginPath="/admin/login">
      <AdminShell>{children}</AdminShell>
    </ProtectedSessionBoundary>
  );
}
