import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession, hasAuthCookie } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function StoreGroupLayout({ children }: { children: ReactNode }) {
  const [session, hasPendingAuth] = await Promise.all([getServerSession(), hasAuthCookie()]);
  if (!session && !hasPendingAuth) redirect("/login");
  return children;
}
