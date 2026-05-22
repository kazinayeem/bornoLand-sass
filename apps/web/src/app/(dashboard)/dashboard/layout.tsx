import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <aside className="border-r border-zinc-200 bg-white px-6 py-8 dark:border-zinc-800 dark:bg-zinc-900">Dashboard navigation</aside>
      <main className="p-6">{children}</main>
    </div>
  );
}