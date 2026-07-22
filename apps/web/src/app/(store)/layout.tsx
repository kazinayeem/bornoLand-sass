import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession, hasAuthCookie } from "@/lib/auth-session";
import { ProtectedSessionBoundary } from "@/components/auth/protected-session-boundary";

export const dynamic = "force-dynamic";

export default async function StoreGroupLayout({ children }: { children: ReactNode }) {
  const [session, hasPendingAuth] = await Promise.all([getServerSession(), hasAuthCookie()]);
  if (!session && !hasPendingAuth) redirect("/login");
  if (session?.role === "super_admin") redirect("/admin/dashboard");
  return <ProtectedSessionBoundary>{children}</ProtectedSessionBoundary>;
}
