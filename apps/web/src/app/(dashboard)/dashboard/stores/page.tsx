"use client";

import { motion } from "framer-motion";
import { useGetMyStoresQuery, useDeleteStoreMutation } from "@/redux/api/store-api";
import { Store, Plus, ExternalLink, Trash2, Edit, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/status-badge";
import Link from "next/link";
import { toast } from "sonner";

const planColors: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700", starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700", enterprise: "bg-amber-50 text-amber-700"
};

export default function MyStoresPage() {
  const { data, isLoading } = useGetMyStoresQuery();
  const [deleteStore] = useDeleteStoreMutation();
  const stores = data?.data?.stores ?? [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteStore(id).unwrap();
      toast.success("Store deleted");
    } catch {
      toast.error("Failed to delete store");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">My Stores</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage all your stores.</p>
        </div>
        <Link href="/dashboard/create-store"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Store
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <Store className="h-16 w-16 text-zinc-300" />
            <h3 className="text-xl font-semibold text-zinc-700">No stores yet</h3>
            <p className="text-sm text-zinc-500">Create your first store to start building.</p>
            <Link href="/dashboard/create-store"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
              Create Your First Store
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store, i) => (
            <motion.div key={store._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                    {store.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900">{store.name}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1"><Globe className="h-3 w-3" />{store.subdomain}</p>
                  </div>
                </div>
                <StatusBadge status={store.status} />
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{store.description || "No description"}</p>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                <span className={["rounded-lg px-2.5 py-0.5 text-xs font-medium", planColors[store.plan] ?? planColors.free].join(" ")}>
                  {store.plan}
                </span>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(store._id, store.name)}
                    className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
