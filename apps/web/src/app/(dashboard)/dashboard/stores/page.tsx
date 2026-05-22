"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMyStoresQuery, useDeleteStoreMutation, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import type { Store } from "@/redux/api/store-api";
import Link from "next/link";
import { toast } from "sonner";
import {
  Store as StoreIcon, Plus, ExternalLink, Trash2, Edit, Globe, Palette,
  Settings, BarChart3, MoreHorizontal, Calendar, LayoutTemplate, Check, AlertTriangle,
  X, Loader2
} from "lucide-react";

const planColors: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700",
  starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700"
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700"
};

function DeleteModal({ store, onClose, onConfirm }: { store: Store; onClose: () => void; onConfirm: () => void }) {
  const [confirmName, setConfirmName] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Delete Store</h3>
            <p className="text-sm text-zinc-500">This action cannot be undone.</p>
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
          <button onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={confirmName !== store.name}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ThemeDrawer({ store, onClose }: { store: Store; onClose: () => void }) {
  const [changeTheme, { isLoading }] = useChangeStoreThemeMutation();
  const { data: templatesData } = useGetTemplatesQuery();
  const templates = templatesData?.data?.templates ?? [];
  const [theme, setTheme] = useState(store.theme);
  const [selectedTemplate, setSelectedTemplate] = useState(
    typeof store.selectedTemplateId === "object" ? store.selectedTemplateId._id : ""
  );

  const templateObj = typeof store.selectedTemplateId === "object" ? store.selectedTemplateId : null;

  const handleSave = async () => {
    try {
      await changeTheme({
        id: store._id,
        data: {
          templateId: selectedTemplate || undefined,
          theme: theme
        }
      }).unwrap();
      toast.success("Theme updated");
      onClose();
    } catch {
      toast.error("Failed to update theme");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-md overflow-y-auto border-l border-zinc-200 bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-100 bg-white p-4">
          <h3 className="text-lg font-semibold text-zinc-900">Customize Theme</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-6 p-4">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">Preview</p>
                <p className="text-xs text-zinc-400">{store.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: theme.primaryColor }} />
                <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: theme.secondaryColor }} />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Template</label>
            <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
              <option value="">{templateObj?.name ?? "Current template"}</option>
              {templates.filter((t) => t._id !== selectedTemplate).map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={theme.primaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5" />
              <input type="text" value={theme.primaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))}
                className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={theme.secondaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))}
                className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-200 bg-white p-0.5" />
              <input type="text" value={theme.secondaryColor}
                onChange={(e) => setTheme((t) => ({ ...t, secondaryColor: e.target.value }))}
                className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Font</label>
            <select value={theme.font} onChange={(e) => setTheme((t) => ({ ...t, font: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
              {["Inter", "Roboto", "Open Sans", "Poppins", "Playfair Display", "Space Grotesk"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Button Style</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "rounded-sm", label: "Sharp" },
                { value: "rounded-lg", label: "Rounded" },
                { value: "rounded-2xl", label: "Pill" }
              ].map((s) => (
                <button key={s.value} onClick={() => setTheme((t) => ({ ...t, buttonStyle: s.value }))}
                  className={`rounded-xl border-2 py-2 text-xs font-medium transition-all ${
                    theme.buttonStyle === s.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Navbar Style</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "fixed", label: "Fixed" },
                { value: "static", label: "Static" },
                { value: "sticky", label: "Sticky" }
              ].map((s) => (
                <button key={s.value} onClick={() => setTheme((t) => ({ ...t, navbarStyle: s.value }))}
                  className={`rounded-xl border-2 py-2 text-xs font-medium transition-all ${
                    theme.navbarStyle === s.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Layout Width</label>
            <select value={theme.layoutWidth} onChange={(e) => setTheme((t) => ({ ...t, layoutWidth: e.target.value }))}
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700">
              {["960px", "1140px", "1200px", "1320px", "100%"].map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Dark Mode</p>
              <p className="text-xs text-zinc-400">Toggle dark/light theme</p>
            </div>
            <button onClick={() => setTheme((t) => ({ ...t, darkMode: !t.darkMode }))}
              className={`relative h-6 w-11 rounded-full transition-colors ${theme.darkMode ? "bg-blue-600" : "bg-zinc-200"}`}>
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${theme.darkMode ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </div>
        <div className="sticky bottom-0 border-t border-zinc-100 bg-white p-4">
          <button onClick={handleSave} disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyStoresPage() {
  const { data, isLoading } = useGetMyStoresQuery();
  const [deleteStore, { isLoading: deleting }] = useDeleteStoreMutation();
  const stores = data?.data?.stores ?? [];
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [themeStore, setThemeStore] = useState<Store | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getSubdomainUrl = (store: Store) => {
    const sl = store.subdomain || store.slug;
    return `http://${sl}.localhost:3002`;
  };

  const handleDelete = async () => {
    if (!storeToDelete) return;
    try {
      await deleteStore(storeToDelete._id).unwrap();
      toast.success("Store deleted");
      setStoreToDelete(null);
    } catch {
      toast.error("Failed to delete store");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">My Stores</h2>
          <p className="mt-1 text-sm text-zinc-500">Manage all your stores in one place.</p>
        </div>
        <Link href="/dashboard/create-store"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md active:scale-95">
          <Plus className="h-4 w-4" /> New Store
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
            <StoreIcon className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-zinc-900">No stores yet</h3>
          <p className="mt-2 text-sm text-zinc-500">Create your first store to start building your brand.</p>
          <Link href="/dashboard/create-store"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Create Your First Store
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store, i) => {
            const templateName = typeof store.selectedTemplateId === "object"
              ? store.selectedTemplateId.name : null;
            return (
              <motion.div key={store._id} layout initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white shadow-sm">
                        {store.name[0]}
                        {store.logoUrl && (
                          <img src={store.logoUrl} alt="" className="absolute inset-0 h-full w-full rounded-xl object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-zinc-900">{store.name}</h3>
                        <p className="flex items-center gap-1 text-xs text-zinc-400">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">{store.subdomain || store.slug}.bornoland.com</span>
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === store._id ? null : store._id)}
                        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === store._id && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
                            onClick={() => setOpenMenuId(null)}>
                            {[
                              { icon: ExternalLink, label: "Visit Store", href: getSubdomainUrl(store), external: true },
                              { icon: Edit, label: "Edit Store", href: `/dashboard/stores/${store._id}` },
                              { icon: Palette, label: "Customize Theme", action: () => setThemeStore(store) },
                              { icon: Settings, label: "Settings", href: `/dashboard/stores/${store._id}/settings` },
                              { icon: BarChart3, label: "Analytics", href: `/dashboard/stores/${store._id}/analytics` },
                              { icon: Trash2, label: "Delete", action: () => setStoreToDelete(store), danger: true }
                            ].map((item) => (
                              item.href ? (
                                <Link key={item.label} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined}
                                  className={`flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-50"}`}>
                                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                                </Link>
                              ) : (
                                <button key={item.label} onClick={item.action}
                                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-50"}`}>
                                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                                </button>
                              )
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-zinc-500 min-h-[2.5rem]">
                    {store.description || "No description"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {templateName && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                        <LayoutTemplate className="h-3 w-3" /> {templateName}
                      </span>
                    )}
                    <span className={["rounded-lg px-2 py-0.5 text-[10px] font-medium",
                      planColors[store.plan] ?? planColors.free].join(" ")}>
                      {store.plan}
                    </span>
                    <span className={["rounded-lg px-2 py-0.5 text-[10px] font-medium",
                      statusColors[store.status] ?? statusColors.draft].join(" ")}>
                      {store.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[10px] text-zinc-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(store.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>

                <div className="flex border-t border-zinc-100 divide-x divide-zinc-100">
                  <a href={getSubdomainUrl(store)} target="_blank" rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-600">
                    <ExternalLink className="h-3.5 w-3.5" /> Visit
                  </a>
                  <button onClick={() => setThemeStore(store)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-violet-50 hover:text-violet-600">
                    <Palette className="h-3.5 w-3.5" /> Theme
                  </button>
                  <Link href={`/dashboard/stores/${store._id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {storeToDelete && <DeleteModal store={storeToDelete} onClose={() => setStoreToDelete(null)} onConfirm={handleDelete} />}
      </AnimatePresence>

      <AnimatePresence>
        {themeStore && <ThemeDrawer store={themeStore} onClose={() => setThemeStore(null)} />}
      </AnimatePresence>
    </div>
  );
}
