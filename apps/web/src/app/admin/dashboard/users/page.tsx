"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGetAdminUsersQuery, useSuspendUserMutation, useActivateUserMutation, useDeleteAdminUserMutation } from "@/redux/api/admin-api";
import { Search, Shield, MoreHorizontal, Ban, CheckCircle, Trash2, Store, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { toast } from "sonner";

const roles = ["all", "super_admin", "admin", "editor", "analyst", "viewer"];

export default function UsersPage() {
  const { data, isLoading } = useGetAdminUsersQuery();
  const [suspendUser] = useSuspendUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();
  const users = data?.data?.users ?? [];

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const perPage = 10;

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSuspend = async (id: string) => {
    try { await suspendUser(id).unwrap(); toast.success("User suspended"); setMenuOpen(null); }
    catch { toast.error("Failed to suspend user"); }
  };

  const handleActivate = async (id: string) => {
    try { await activateUser(id).unwrap(); toast.success("User activated"); setMenuOpen(null); }
    catch { toast.error("Failed to activate user"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user permanently? Their stores will also be deleted.")) return;
    try { await deleteUser(id).unwrap(); toast.success("User deleted"); setMenuOpen(null); }
    catch { toast.error("Failed to delete user"); }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Users</h2>
        <p className="mt-1 text-sm text-zinc-500">{users.length} platform users</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search users..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
          <option value="all">All Roles</option>
          {roles.slice(1).map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
          <option value="invited">Invited</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Stores</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Last Login</th>
                <th className="px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paged.map((user) => (
                <tr key={user._id} className="group transition-colors hover:bg-zinc-50">
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
                  <td className="px-6 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm text-zinc-700">
                      <Store className="h-3.5 w-3.5 text-zinc-400" />
                      {user.storeCount ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-zinc-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}
                  </td>
                  <td className="px-6 py-3.5 relative">
                    <button onClick={() => setMenuOpen(menuOpen === user._id ? null : user._id)}
                      className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpen === user._id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                          {user.status !== "suspended" ? (
                            <button onClick={() => handleSuspend(user._id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50">
                              <Ban className="h-4 w-4" /> Suspend
                            </button>
                          ) : (
                            <button onClick={() => handleActivate(user._id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-emerald-600 hover:bg-emerald-50">
                              <CheckCircle className="h-4 w-4" /> Activate
                            </button>
                          )}
                          <button onClick={() => handleDelete(user._id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-zinc-500">No users found</td></tr>
              )}
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
      </div>
    </div>
  );
}
