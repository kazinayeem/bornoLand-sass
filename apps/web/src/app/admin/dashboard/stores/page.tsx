"use client";

import { useState } from "react";
import { useGetAdminStoresQuery, useSuspendStoreMutation, useActivateStoreMutation, useDeleteAdminStoreMutation, useChangeStorePlanMutation } from "@/redux/api/admin-api";
import { useGetPlansQuery } from "@/redux/api/store-api";
import { Search, Globe, MoreHorizontal, ExternalLink, Ban, CheckCircle, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreDetailDrawer } from "@/components/admin/store-detail-drawer";
import type { AdminStore } from "@/redux/api/admin-api";
import { getStoreDisplayDomain, getStoreUrl } from "@/lib/urls";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

const planColors: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700", starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700", enterprise: "bg-amber-50 text-amber-700"
};
const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700", draft: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700", pending: "bg-blue-100 text-blue-700"
};

export default function AdminStoresPage() {
  const { data, isLoading } = useGetAdminStoresQuery();
  const { data: plansData } = useGetPlansQuery();
  const [suspendStore] = useSuspendStoreMutation();
  const [activateStore] = useActivateStoreMutation();
  const [deleteStore] = useDeleteAdminStoreMutation();
  const [changePlan] = useChangeStorePlanMutation();

  const stores = data?.data?.stores ?? [];
  const plans = plansData?.data?.plans ?? [];
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);
  const perPage = 10;

  const filtered = stores.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.subdomain?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSuspend = async (id: string) => {
    try { await suspendStore(id).unwrap(); toast.success("Store suspended"); }
    catch { toast.error("Failed to suspend store"); }
  };

  const handleActivate = async (id: string) => {
    try { await activateStore(id).unwrap(); toast.success("Store activated"); }
    catch { toast.error("Failed to activate store"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this store permanently? This will also delete all products and orders.")) return;
    try { await deleteStore(id).unwrap(); toast.success("Store deleted"); }
    catch { toast.error("Failed to delete store"); }
  };

  const handleChangePlan = async (storeId: string, planId: string, planName: string) => {
    try {
      await changePlan({ id: storeId, data: { planId } }).unwrap();
      toast.success(`Plan changed to ${planName}`);
    } catch { toast.error("Failed to change plan"); }
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
      <AdminPageHeader
        title="Stores"
        description={`${stores.length} stores on the platform`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search stores..." className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-600">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Revenue</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paged.map((s) => (
                <tr
                  key={s._id}
                  className="group cursor-pointer transition-colors hover:bg-zinc-50"
                  onClick={() => setSelectedStore(s as AdminStore)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                        {s.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-900">{s.name}</p>
                        <p className="flex items-center gap-1 text-xs text-zinc-500">
                          <Globe className="h-3 w-3" /> {getStoreDisplayDomain(s.subdomain || s.slug)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700">{(s.userId as any)?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${planColors[s.plan] ?? planColors.free}`}>{s.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${statusColors[s.status] ?? statusColors.draft}`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-zinc-900">{formatCurrency(s.revenueBDT ?? 0)}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">{s.orderCount ?? 0}</td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {/* Portal-based DropdownMenu — escapes overflow-x-auto table stacking context */}
                    <DropdownMenu
                      placement="bottom-end"
                      minWidth={176}
                      trigger={
                        <button
                          className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-700 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                      items={[
                        { label: "Open Store",   icon: ExternalLink, onClick: () => window.open(getStoreUrl(s.subdomain || s.slug), "_blank") },
                        ...(s.status !== "suspended"
                          ? [{ label: "Suspend", icon: Ban,         onClick: () => handleSuspend(s._id), warning: true }]
                          : [{ label: "Activate",icon: CheckCircle, onClick: () => handleActivate(s._id) }]
                        ),
                        { divider: true },
                        { label: "Change Plan",  icon: RefreshCw,   onClick: () => {}, disabled: true },
                        ...plans.filter((p) => p._id !== s.planId).map((p) => ({
                          label: p.name,
                          icon: RefreshCw,
                          onClick: () => handleChangePlan(s._id, p._id, p.name),
                        })),
                        { divider: true },
                        { label: "Delete",       icon: Trash2,      onClick: () => handleDelete(s._id), danger: true },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-500">No stores found</td></tr>
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

      <StoreDetailDrawer
        store={selectedStore}
        plans={plans}
        open={!!selectedStore}
        onClose={() => setSelectedStore(null)}
      />
    </div>
  );
}
