"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGetMyStoresQuery } from "@/redux/api/store-api";
import { Store, Globe, Calendar, Search } from "lucide-react";

const planColors: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700",
  starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700"
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700"
};

export default function AdminStoresPage() {
  const { data, isLoading } = useGetMyStoresQuery();
  const stores = data?.data?.stores ?? [];
  const [search, setSearch] = useState("");

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Stores</h2>
          <p className="mt-1 text-sm text-zinc-500">{stores.length} stores on the platform</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..." className="h-10 w-64 rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Store</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Subdomain</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((s) => (
              <tr key={s._id} className="transition-colors hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                      {s.name[0]}
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-sm text-zinc-500">
                    <Globe className="h-3.5 w-3.5" /> {s.subdomain || s.slug}.bornoland.com
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${planColors[s.plan] ?? planColors.free}`}>{s.plan}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${statusColors[s.status] ?? statusColors.draft}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500">
                  {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
