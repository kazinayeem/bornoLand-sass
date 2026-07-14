"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Loader2, Plus, RefreshCw, Store } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/workspace/page-header";
import { StoreCard } from "@/components/dashboard/stores/store-card";
import { StoreDrawer } from "@/components/dashboard/stores/store-drawer";
import { DeleteStoreModal } from "@/components/dashboard/stores/delete-store-modal";
import {
  useGetMyStoresQuery,
  useGetPlansQuery,
  useDeleteStoreMutation,
  type Store as StoreType,
} from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { resolveStoreStatus } from "@/lib/store-status";
import { useRouter } from "next/navigation";

export default function StoresPage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useGetMyStoresQuery();
  const { data: plansData } = useGetPlansQuery();
  const { data: templatesData } = useGetTemplatesQuery();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  const stores = data?.data?.stores ?? [];
  const activeStores = useMemo(
    () => stores.filter((s) => resolveStoreStatus(s) !== "archived"),
    [stores]
  );
  const plans = plansData?.data?.plans ?? [];
  const templates = templatesData?.data?.templates ?? [];

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreType | null>(null);
  const [workspaceStore, setWorkspaceStore] = useState<StoreType | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const requestDelete = (s: StoreType) => {
    setDeleteTarget(s);
    setShowDeleteModal(true);
  };

  const openWorkspace = (s: StoreType, tab?: "overview" | "billing" | "theme") => {
    setWorkspaceStore(s);
    setWorkspaceOpen(true);
  };

  const handleDeleteStore = async (storeId: string) => {
    try {
      await deleteStore(storeId).unwrap();
      toast.success("Store deleted successfully.");
      setShowDeleteModal(false);
      setDeleteTarget(null);

      const storesAfterDelete = activeStores.filter((s) => s._id !== storeId);
      if (storesAfterDelete.length === 0) {
        router.push("/dashboard");
      } else {
        refetch();
      }
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "data" in err
        ? (err as { data?: { message?: string } }).data?.message
        : undefined;
      toast.error(message ?? "Failed to delete store");
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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {activeStores.map((store, idx) => (
              <StoreCard
                key={store._id}
                store={store}
                plans={plans}
                index={idx}
                onManage={(s, tab) => openWorkspace(s, tab)}
                onDelete={requestDelete}
              />
            ))}
          </AnimatePresence>
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

      <DeleteStoreModal
        store={deleteTarget}
        open={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteStore}
        loading={isDeleting}
      />
    </div>
  );
}
