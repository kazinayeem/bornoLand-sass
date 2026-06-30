import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function StoreGroupLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return children;
}
