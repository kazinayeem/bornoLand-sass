"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3, Box, CreditCard, Globe, LayoutGrid,
  Loader2, Plus, RefreshCw, Settings as SettingsIcon,
  Store, Trash2, X, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyStoresQuery, useGetPlansQuery, useDeleteStoreMutation,
  type Store as StoreType,
} from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { setStores } from "@/redux/slices/stores-slice";
import { setPlans as setPlansSlice, setSelectedPlan } from "@/redux/slices/plan-slice";
import { StoreCard } from "@/components/dashboard/stores/store-card";
import { getStoreDisplayDomain } from "@/utils/domain";

function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency", currency: "BDT", maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function DashboardHomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data, isLoading } = useGetMyStoresQuery();
  const { data: plansData } = useGetPlansQuery();
  const { data: templatesData } = useGetTemplatesQuery();
  const [deleteStore] = useDeleteStoreMutation();

  const stores = data?.data?.stores ?? [];
  const plans = plansData?.data?.plans ?? [];
  const templates = templatesData?.data?.templates ?? [];

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreType | null>(null);
  const [confirmName, setConfirmName] = useState("");

  useEffect(() => {
    dispatch(setStores(stores));
  }, [dispatch, stores]);

  useEffect(() => {
    dispatch(setPlansSlice(plans));
  }, [dispatch, plans]);

  const metrics = useMemo(() => {
    return stores.reduce(
      (acc, s) => {
        acc.products += s.productCount ?? 0;
        acc.orders += s.orderCount ?? 0;
        acc.revenue += s.revenueBDT ?? 0;
        if (s.status === "active") acc.active += 1;
        return acc;
      },
      { active: 0, products: 0, orders: 0, revenue: 0 }
    );
  }, [stores]);

  const requestDelete = (s: StoreType) => {
    setDeleteTarget(s);
    setConfirmName("");
    setShowDeleteConfirm(true);
  };

  const handleDeleteStore = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStore(deleteTarget._id).unwrap();
      toast.success("Store deleted");
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete");
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
    <div className="space-y-6">
      {/* ── Hero section ── */}
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50/50 to-blue-50/30 shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-700">
              <Sparkles className="h-3.5 w-3.5" /> Store Command Center
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">Manage every store from a single premium control surface.</h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">Track orders, products, revenue, and launch actions without bouncing between pages.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/create-store"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors">
                <Plus className="h-4 w-4" /> Create Store
              </Link>
              <button onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Active", value: String(metrics.active), icon: Store, color: "text-blue-600" },
              { label: "Products", value: String(metrics.products), icon: Box, color: "text-emerald-600" },
              { label: "Orders", value: String(metrics.orders), icon: BarChart3, color: "text-amber-600" },
              { label: "Revenue", value: formatBDT(metrics.revenue), icon: CreditCard, color: "text-violet-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{item.label}</p>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <p className="mt-2 text-xl font-bold text-zinc-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Store Grid / Empty State ── */}
      {stores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center shadow-sm">
          <Store className="mx-auto h-10 w-10 text-zinc-300" />
          <h3 className="mt-3 text-lg font-semibold text-zinc-900">No stores yet</h3>
          <p className="mt-1 text-sm text-zinc-500">Create your first store to unlock the dashboard.</p>
          <Link href="/dashboard/create-store" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors">
            <Plus className="h-4 w-4" /> Create your first store
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stores.map((store, idx) => (
            <StoreCard
              key={store._id}
              store={store}
              plans={plans}
              index={idx}
              onManage={(s, _tab) => router.push(`/dashboard/stores/${s._id}`)}
              onDelete={requestDelete}
            />
          ))}
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      <AnimatePresence>
        {showDeleteConfirm && deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl">
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
                <p className="text-xs text-zinc-500">{getStoreDisplayDomain(deleteTarget.subdomain, deleteTarget.slug)}</p>
              </div>
              <input value={confirmName} onChange={(e) => setConfirmName(e.target.value)}
                placeholder={deleteTarget.name}
                className="mt-3 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20" />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeleteStore} disabled={confirmName !== deleteTarget.name}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
