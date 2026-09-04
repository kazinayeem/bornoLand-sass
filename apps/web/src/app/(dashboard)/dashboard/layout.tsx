import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
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
  const [session, hasPendingAuth, headerList] = await Promise.all([
    getServerSession(),
    hasAuthCookie(),
    headers(),
  ]);
  if (!session && !hasPendingAuth) redirect("/login");

  const pathname = headerList.get("x-pathname") || "";
  const isSuperAdmin = session?.role === "super_admin";

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

  // If authenticated user is NOT super admin, redirect to their own store dashboard
  if (session && !isSuperAdmin) {
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
