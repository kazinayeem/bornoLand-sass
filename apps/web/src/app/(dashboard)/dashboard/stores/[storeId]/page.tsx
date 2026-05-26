"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetStoreQuery, useUpdateStoreMutation, useDeleteStoreMutation, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { useGetStoreSettingsQuery, useUpdateStoreSettingsMutation } from "@/redux/api/store-settings-api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, ExternalLink, Trash2, Save, Palette, Globe, Store,
  Check, X, AlertTriangle, Loader2
} from "lucide-react";
import Link from "next/link";

const planColors: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700", starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700", enterprise: "bg-amber-50 text-amber-700"
};

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.storeId as string;

  const { data, isLoading } = useGetStoreQuery(storeId);
  const [updateStore, { isLoading: updating }] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: deleting }] = useDeleteStoreMutation();
  const [changeTheme] = useChangeStoreThemeMutation();
  const { data: templatesData } = useGetTemplatesQuery();
  const templates = templatesData?.data?.templates ?? [];

  const { data: settingsData } = useGetStoreSettingsQuery(storeId);
  const [updateStoreSettings] = useUpdateStoreSettingsMutation();
  const currencyCode = settingsData?.data?.settings?.currencyCode ?? "BDT";

  const store = data?.data?.store;
  const [showDelete, setShowDelete] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [showTheme, setShowTheme] = useState(false);
  const [themeForm, setThemeForm] = useState<Record<string, unknown>>({});


  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
    </div>
  );

  if (!store) return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
      <Store className="mx-auto h-12 w-12 text-zinc-300" />
      <h3 className="mt-4 text-lg font-semibold text-zinc-700">Store not found</h3>
      <Link href="/dashboard/stores" className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to stores
      </Link>
    </div>
  );

  const templateName = typeof store.selectedTemplateId === "object" ? store.selectedTemplateId.name : null;
  const subdomainUrl = `http://${store.subdomain || store.slug}.localhost:3002`;

  const handleSave = async () => {
    try {
      await updateStore({ id: storeId, data: { name: store.name, description: store.description } }).unwrap();
      toast.success("Store updated");
    } catch {
      toast.error("Failed to update store");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStore(storeId).unwrap();
      toast.success("Store deleted");
      router.push("/dashboard/stores");
    } catch {
      toast.error("Failed to delete store");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/stores" className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{store.name}</h2>
            <p className="flex items-center gap-1 text-sm text-zinc-500">
              <Globe className="h-3.5 w-3.5" /> {subdomainUrl}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={subdomainUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            <ExternalLink className="h-4 w-4" /> Visit
          </a>
          <button onClick={handleSave} disabled={updating}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
            {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </button>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Store Info</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Name</label>
              <input type="text" defaultValue={store.name}
                onBlur={(e) => { store.name = e.target.value; }}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Slug</label>
              <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3">
                <input type="text" defaultValue={store.slug} disabled
                  className="h-10 flex-1 bg-transparent text-sm text-zinc-500 focus:outline-none" />
                <span className="text-xs text-zinc-400">.{process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornoland.com"}</span>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Description</label>
              <textarea defaultValue={store.description}
                onBlur={(e) => { store.description = e.target.value; }} rows={3}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">Details</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                <span className="text-sm text-zinc-600">Plan</span>
                <span className={["rounded-lg px-2.5 py-0.5 text-xs font-medium", planColors[store.plan] ?? planColors.free].join(" ")}>
                  {store.plan}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                <span className="text-sm text-zinc-600">Status</span>
                <span className={["rounded-lg px-2.5 py-0.5 text-xs font-medium",
                  store.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                ].join(" ")}>
                  {store.status}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                <span className="text-sm text-zinc-600">Category</span>
                <span className="text-sm font-medium text-zinc-900">{store.category}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                <span className="text-sm text-zinc-600">Template</span>
                <span className="text-sm font-medium text-zinc-900">{templateName || "None"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
                <span className="text-sm text-zinc-600">Created</span>
                <span className="text-sm font-medium text-zinc-900">
                  {new Date(store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">Currency</h3>
            <p className="mt-1 text-xs text-zinc-500">Select the currency for this store.</p>
            <div className="mt-4 flex items-center gap-3">
              <select value={currencyCode}
                onChange={(e) => {
                  const code = e.target.value as "USD" | "BDT";
                  const sym = code === "BDT" ? "\u09f3" : "$";
                  const pos: "before" = "before";
                  const loc = code === "BDT" ? "bn-BD" : "en-US";
                  const dec = code === "BDT" ? 0 : 2;
                  updateStoreSettings({ storeId, data: { currencyCode: code, currencySymbol: sym, currencyPosition: pos, locale: loc, decimalPlaces: dec } });
                  toast.success(`Currency changed to ${code} (${sym})`);
                }}
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="BDT">BDT (৳)</option>
                <option value="USD">USD ($)</option>
              </select>
              <span className="text-sm text-zinc-400">
                {currencyCode === "BDT" ? "৳1,000" : "$1,000.00"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900">Actions</h3>
            <div className="mt-4 space-y-2">
              <button onClick={() => setShowTheme(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                <Palette className="h-5 w-5 text-violet-500" /> Customize Theme
              </button>
              <a href={subdomainUrl} target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                <ExternalLink className="h-5 w-5 text-blue-500" /> Visit Live Site
              </a>
              <button onClick={() => setShowDelete(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
                <Trash2 className="h-5 w-5" /> Delete Store
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowDelete(false); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Delete Store</h3>
                  <p className="text-sm text-zinc-500">This cannot be undone.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-zinc-50 p-3">
                <p className="text-sm font-medium text-zinc-700">{store.name}</p>
                <p className="text-xs text-zinc-400">{store.subdomain}.bornoland.com</p>
              </div>
              <p className="mt-4 text-sm text-zinc-600">
                Type <span className="font-semibold text-red-600">{store.name}</span> to confirm:
              </p>
              <input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)}
                placeholder={store.name}
                className="mt-2 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20" />
              <div className="mt-6 flex items-center justify-end gap-3">
                <button onClick={() => setShowDelete(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">Cancel</button>
                <button onClick={handleDelete} disabled={confirmName !== store.name || deleting}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTheme && store && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowTheme(false); }}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-zinc-100 bg-white p-4">
                <h3 className="text-lg font-semibold text-zinc-900">Customize Theme</h3>
                <button onClick={() => setShowTheme(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"><X className="h-5 w-5" /></button>
              </div>
              <div className="space-y-6 p-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-zinc-900">{store.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: (themeForm.primaryColor as string) || store.theme?.primaryColor }} />
                      <span className="h-5 w-5 rounded-full border" style={{ backgroundColor: (themeForm.secondaryColor as string) || store.theme?.secondaryColor }} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Template</label>
                  <select defaultValue={typeof store.selectedTemplateId === "object" ? store.selectedTemplateId._id : ""}
                    onChange={(e) => setThemeForm((f) => ({ ...f, templateId: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                    <option value="">{templateName || "Current"}</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Primary Color</label>
                  <input type="color" defaultValue={store.theme?.primaryColor ?? "#2563eb"}
                    onChange={(e) => setThemeForm((f) => ({ ...f, primaryColor: e.target.value }))}
                    className="h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white p-1" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Secondary Color</label>
                  <input type="color" defaultValue={store.theme?.secondaryColor ?? "#0f172a"}
                    onChange={(e) => setThemeForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                    className="h-10 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white p-1" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-700">Font</label>
                  <select defaultValue={store.theme?.font ?? "Inter"}
                    onChange={(e) => setThemeForm((f) => ({ ...f, font: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm">
                    {["Inter", "Roboto", "Open Sans", "Poppins", "Playfair Display", "Space Grotesk"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sticky bottom-0 border-t border-zinc-100 bg-white p-4">
                <button onClick={async () => {
                  try {
                    await changeTheme({ id: storeId, data: { theme: themeForm } }).unwrap();
                    toast.success("Theme updated");
                    setShowTheme(false);
                  } catch { toast.error("Failed to update theme"); }
                }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  <Check className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
