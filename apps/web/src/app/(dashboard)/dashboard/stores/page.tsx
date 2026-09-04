"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Loader2, Plus, RefreshCw, Store, Search } from "lucide-react";
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
import { useLanguage } from "@/providers/language-provider";

export default function StoresPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const isBn = false;
  const { data, isLoading, refetch } = useGetMyStoresQuery();
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
      toast.success(isBn ? "দোকানটি সফলভাবে মুছে ফেলা হয়েছে।" : "Store deleted successfully.");
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
      toast.error(message ?? (isBn ? "দোকান মুছে ফেলা সম্ভব হয়নি" : "Could not delete store"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-apple-ink-muted-48" />
      </div>
    );
  }

  const tabs = [
    { id: "all", label: isBn ? "সব" : "All" },
    { id: "active", label: isBn ? "সক্রিয়" : "Active" },
    { id: "trial", label: isBn ? "ট্রায়াল" : "Trial" },
    { id: "expired", label: isBn ? "মেয়াদ শেষ / বাকি" : "Expired / Due" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={isBn ? "সব দোকান" : "All Stores"}
        description={isBn ? "আপনার ওয়ার্কস্পেসের সব অনলাইন দোকান এক জায়গা থেকে সহজে ম্যানেজ করুন।" : "Manage all your online stores from one place."}
        actions={
          <>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment"
            >
              <RefreshCw className="h-4 w-4" />
              {t.common.refresh}
            </button>
            <Link
              href="/dashboard/stores/create"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              {t.navigation.createStore}
            </Link>
          </>
        }
      />

      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? "দোকানের নাম বা ডোমেইন খুঁজুন..." : "Search store name or domain..."}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-zinc-900 placeholder:text-zinc-400"
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
                  ? "bg-zinc-950 text-white font-bold shadow-2xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredStores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm space-y-3">
          <Store className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="text-lg font-semibold text-apple-ink">
            {searchQuery || statusFilter !== "all"
              ? (isBn ? "কোনো দোকান পাওয়া যায়নি" : "No stores found")
              : (isBn ? "এখনও কোনো দোকান নেই" : "No stores yet")}
          </h3>
          <p className="text-sm text-apple-ink-muted-48 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "all"
              ? (isBn ? "আপনার সার্চ বা ফিল্টার ফিল্ড পরিবর্তন করে আবার চেষ্টা করুন।" : "Try adjusting your search or filter options.")
              : (isBn ? "অনলাইনে পণ্য বিক্রি শুরু করতে আপনার প্রথম দোকানটি তৈরি করুন।" : "Create your first store to start selling online.")}
          </p>
          <Link
            href="/dashboard/stores/create"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            {t.navigation.createStore}
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
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDeleteStore}
        loading={isDeleting}
      />
    </div>
  );
}
