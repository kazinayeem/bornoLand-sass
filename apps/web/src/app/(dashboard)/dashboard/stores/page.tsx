"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, RefreshCw, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { PageHeader } from "@/components/workspace/page-header";
import { StoreCard } from "@/components/dashboard/stores/store-card";
import { StoreDrawer } from "@/components/dashboard/stores/store-drawer";
import {
  useGetMyStoresQuery,
  useGetPlansQuery,
  useDeleteStoreMutation,
  type Store as StoreType,
} from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { setStores } from "@/redux/slices/stores-slice";
import { setPlans as setPlansSlice } from "@/redux/slices/plan-slice";
import { resolveStoreStatus } from "@/lib/store-status";

export default function StoresPage() {
  const dispatch = useDispatch();
  const { data, isLoading, refetch } = useGetMyStoresQuery();
  const { data: plansData } = useGetPlansQuery();
  const { data: templatesData } = useGetTemplatesQuery();
  const [deleteStore] = useDeleteStoreMutation();

  const stores = data?.data?.stores ?? [];
  const activeStores = useMemo(
    () => stores.filter((s) => resolveStoreStatus(s) !== "archived"),
    [stores]
  );
  const plans = plansData?.data?.plans ?? [];
  const templates = templatesData?.data?.templates ?? [];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreType | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [workspaceStore, setWorkspaceStore] = useState<StoreType | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  useEffect(() => {
    dispatch(setStores(stores));
  }, [dispatch, stores]);

  useEffect(() => {
    dispatch(setPlansSlice(plans));
  }, [dispatch, plans]);

  const requestDelete = (s: StoreType) => {
    setDeleteTarget(s);
    setConfirmName("");
    setShowDeleteConfirm(true);
  };

  const openWorkspace = (s: StoreType) => {
    setWorkspaceStore(s);
    setWorkspaceOpen(true);
  };

  const handleDeleteStore = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStore(deleteTarget._id).unwrap();
      toast.success("Store deleted");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined;
      toast.error(message ?? "Failed to delete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="All Stores"
        description="Manage every store in your workspace from one place."
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link
              href="/dashboard/stores/create"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Link>
          </>
        }
      />

      {activeStores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
          <Store className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-lg font-semibold text-zinc-900">No stores yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Create your first store to start selling.</p>
          <Link
            href="/dashboard/stores/create"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Create your first store
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activeStores.map((store, idx) => (
            <StoreCard
              key={store._id}
              store={store}
              plans={plans}
              index={idx}
              onManage={(s) => openWorkspace(s)}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      <StoreDrawer
        store={workspaceStore}
        plans={plans}
        templates={templates}
        isOpen={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        onDelete={requestDelete}
      />

      <AnimatePresence>
        {showDeleteConfirm && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDeleteConfirm(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900">Delete store</h4>
                  <p className="mt-0.5 text-sm text-zinc-500">Type the store name to confirm.</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-zinc-50 p-3">
                <p className="text-sm font-semibold text-zinc-900">{deleteTarget.name}</p>
                <p className="text-xs text-zinc-500">{deleteTarget.subdomain}.bornoland.com</p>
              </div>
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={deleteTarget.name}
                className="mt-3 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStore}
                  disabled={confirmName !== deleteTarget.name}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
