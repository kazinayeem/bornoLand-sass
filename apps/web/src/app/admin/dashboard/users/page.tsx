"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, MoreHorizontal, Edit, Trash2, Shield, Filter, ArrowUpDown } from "lucide-react";
import { users } from "@/lib/admin/data";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const roles = ["all", "super_admin", "admin", "editor", "analyst", "viewer"];
const statuses = ["all", "active", "invited", "suspended", "banned"];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Users</h2>
        <p className="mt-1 text-sm text-zinc-500">Manage all platform users, roles, and permissions.</p>
      </motion.div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">All Users ({filtered.length})</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="h-9 w-48 rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
              <option value="all">All Roles</option>
              {roles.slice(1).map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
              <option value="all">All Status</option>
              {statuses.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">Last Login</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paged.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-zinc-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                        <Shield className="h-3 w-3" />
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3.5"><StatusBadge status={user.status} /></td>
                    <td className="px-6 py-3.5 text-sm text-zinc-700">{user.tenant}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">{user.joined}</td>
                    <td className="px-6 py-3.5 text-sm text-zinc-500">{user.lastLogin}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                        <button className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
            <p className="text-sm text-zinc-500">Showing {(page * perPage) + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(page - 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
