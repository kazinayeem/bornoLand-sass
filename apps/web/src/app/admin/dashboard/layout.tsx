import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "super_admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 px-6 py-4">BornoLand Admin</header>
      <main className="p-6">{children}</main>
    </div>
  );
}