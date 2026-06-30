import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { buildPageMetadata } from "@/lib/server/page-metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Dashboard • Super Admin",
  description: "Manage the BornoLand platform as Super Admin.",
  canonicalPath: "/admin/dashboard",
});

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.role !== "super_admin") redirect("/unauthorized");
  return <AdminShell>{children}</AdminShell>;
}
