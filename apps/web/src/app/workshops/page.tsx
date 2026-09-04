"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  RefreshCw,
  Store as StoreIcon,
  Search,
  ArrowRight,
  Building2,
} from "lucide-react";
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

function StoreCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs animate-pulse space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-20 rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      <div className="h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />

      <div className="grid grid-cols-4 gap-2 pt-2">
        <div className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
        <div className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <div className="h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function MerchantWorkspacesPage() {
  const router = useRouter();

  const { data, isLoading, isFetching, refetch } = useGetMyStoresQuery();
  const { data: plansData } = useGetPlansQuery();
  const { data: templatesData } = useGetTemplatesQuery();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "trial" | "expired">("all");

  const stores = data?.data?.stores ?? [];
  const activeStores = useMemo(
    () => stores.filter((s) => resolveStoreStatus(s) !== "archived"),
    [stores]
  );

  const filteredStores = useMemo(() => {
    return activeStores.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.subdomain && s.subdomain.toLowerCase().includes(searchQuery.toLowerCase()));

      const sStatus = resolveStoreStatus(s);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && sStatus === "active") ||
        (statusFilter === "trial" && sStatus === "trial") ||
        (statusFilter === "expired" && (sStatus === "expired" || sStatus === "suspended" || sStatus === "pending_payment"));

      return matchesSearch && matchesStatus;
    });
  }, [activeStores, searchQuery, statusFilter]);

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
      refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      toast.error(message ?? "Could not delete store");
    }
  };

  const tabs = [
    { id: "all", label: "All Stores" },
    { id: "active", label: "Active" },
    { id: "trial", label: "Trial" },
    { id: "expired", label: "Expired / Due" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Merchant Workspace"
        description="Select and manage your authorized online stores, operations, and business workspaces."
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/workshops/stores/create"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              <Plus className="h-4 w-4" />
              Create Store
            </Link>
          </>
        }
      />

      {/* Quick Summary Banner if multiple stores exist */}
      {!isLoading && activeStores.length > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-200/80 bg-linear-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50 p-4 sm:p-5 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                You have {activeStores.length} authorized stores
              </h3>
              <p className="text-xs text-zinc-500">
                Click on any store below to launch its management dashboard.
              </p>
            </div>
          </div>
          <Link
            href="/workshops/stores/create"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400"
          >
            + Add another store
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search store name or domain..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-zinc-950 text-white font-bold shadow-2xs dark:bg-white dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <StoreCardSkeleton />
          <StoreCardSkeleton />
          <StoreCardSkeleton />
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-xs space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <StoreIcon className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {searchQuery || statusFilter !== "all"
              ? "No stores found"
              : "No authorized stores yet"}
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter options."
              : "Create your first store to start managing inventory, orders, and sales."}
          </p>
          <Link
            href="/workshops/stores/create"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            <Plus className="h-4 w-4" />
            Create Store
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredStores.map((store, idx) => (
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
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteStore}
        loading={isDeleting}
      />
    </div>
  );
}
