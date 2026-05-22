"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Building2, Globe, Users, FileText, ExternalLink, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { tenants } from "@/lib/admin/data";
import { StatusBadge } from "@/components/admin/status-badge";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = ["all", "free", "starter", "growth", "enterprise"];

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 8;

  const filtered = tenants.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter !== "all" && t.plan !== planFilter) return false;
    return true;
  });
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const planColors: Record<string, string> = {
    free: "bg-zinc-100 text-zinc-700", starter: "bg-blue-50 text-blue-700",
    growth: "bg-purple-50 text-purple-700", enterprise: "bg-amber-50 text-amber-700"
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Tenants</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage all tenant organizations on the platform.</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Tenants" value={tenants.length} icon={Building2} variant="blue" />
        <StatCard title="Active" value={tenants.filter((t) => t.status === "active").length} icon={Users} variant="green" />
        <StatCard title="Monthly Revenue" value={`$${tenants.reduce((s, t) => s + t.revenue, 0).toLocaleString()}`} icon={FileText} variant="default" />
      </div>

      <div className="grid gap-4">
        {paged.map((tenant, i) => (
          <motion.div key={tenant.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                  {tenant.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{tenant.name}</h3>
                  <p className="text-sm text-zinc-500">{tenant.domain}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <StatusBadge status={tenant.status} />
                    <span className={["inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium", planColors[tenant.plan]].join(" ")}>
                      {tenant.plan}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-4">
              <div><p className="text-xs text-zinc-500">Users</p><p className="text-sm font-semibold text-zinc-900">{tenant.users}</p></div>
              <div><p className="text-xs text-zinc-500">Sites</p><p className="text-sm font-semibold text-zinc-900">{tenant.sites}</p></div>
              <div><p className="text-xs text-zinc-500">Revenue</p><p className="text-sm font-semibold text-zinc-900">${tenant.revenue.toLocaleString()}</p></div>
              <div><p className="text-xs text-zinc-500">Created</p><p className="text-sm font-semibold text-zinc-900">{tenant.created}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Showing {(page * perPage) + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Previous</button>
          <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
