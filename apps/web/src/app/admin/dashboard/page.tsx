"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Store, LayoutTemplate, Package, Activity } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";

type Overview = { users: number; stores: number; products: number; templates: number };

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => setData(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back, Admin</h2>
          <p className="mt-1 text-sm text-zinc-500">Platform overview at a glance.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 sm:flex">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-zinc-700">All systems operational</span>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={data?.users ?? "—"} icon={Users} variant="blue" delay={0} />
        <StatCard title="Total Stores" value={data?.stores ?? "—"} icon={Store} variant="green" delay={0.05} />
        <StatCard title="Total Products" value={data?.products ?? "—"} icon={Package} variant="purple" delay={0.1} />
        <StatCard title="Templates" value={data?.templates ?? "—"} icon={LayoutTemplate} variant="amber" delay={0.15} />
      </div>
    </div>
  );
}
