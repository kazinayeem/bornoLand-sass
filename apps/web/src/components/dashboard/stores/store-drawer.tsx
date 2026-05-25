"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Wrench, CreditCard, Palette, Trash2, Loader2, Globe,
  ExternalLink, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useUpdateStoreMutation, useChangeStoreThemeMutation, type Store as StoreType, type Plan } from "@/redux/api/store-api";

type DrawerTab = "overview" | "billing" | "theme";

type StoreDrawerProps = {
  store: StoreType | null;
  plans: Plan[];
  templates: { _id: string; name: string; slug: string; category: string; preview: string }[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (store: StoreType) => void;
};

function formatBDT(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency", currency: "BDT", maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function statusClasses(status?: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "past_due":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "cancelled":
    case "suspended":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200";
  }
}

export function StoreDrawer({ store, plans, templates, isOpen, onClose, onDelete }: StoreDrawerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<DrawerTab>("overview");
  const [updateStore, { isLoading: saving }] = useUpdateStoreMutation();
  const [changeTheme, { isLoading: savingTheme }] = useChangeStoreThemeMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [storeStatus, setStoreStatus] = useState<string>("draft");
  const [planId, setPlanId] = useState("");
  const [billingStatus, setBillingStatus] = useState<string>("trial");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("trialing");
  const [renewalDate, setRenewalDate] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [font, setFont] = useState("Inter");

  const selectedPlan = plans.find((p) => p._id === planId) ?? null;

  useEffect(() => {
    if (!store) return;
    setName(store.name);
    setDescription(store.description);
    setCategory(store.category);
    setStoreStatus(store.status);
    const pid = store.planId && typeof store.planId === "object" ? store.planId._id : "";
    setPlanId(pid);
    setBillingStatus(store.billingStatus ?? "trial");
    setSubscriptionStatus(store.subscriptionStatus ?? "trialing");
    setRenewalDate(store.renewalDate ? store.renewalDate.slice(0, 10) : "");
    setTemplateId(typeof store.selectedTemplateId === "object" ? store.selectedTemplateId._id : "");
    setPrimaryColor(store.theme?.primaryColor ?? "#2563eb");
    setSecondaryColor(store.theme?.secondaryColor ?? "#0f172a");
    setFont(store.theme?.font ?? "Inter");
  }, [store]);

  if (!store) return null;

  const handleSaveStore = async () => {
    if (!store) return;
    try {
      await updateStore({ id: store._id, data: { name, description, category, status: storeStatus } }).unwrap();
      toast.success("Store saved");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save");
    }
  };

  const handleSaveBilling = async () => {
    if (!store) return;
    try {
      const p = plans.find((pl) => pl._id === planId) ?? null;
      await updateStore({
        id: store._id,
        data: {
          plan: p?.slug ?? store.plan,
          planId: planId || undefined,
          billingStatus: billingStatus as StoreType["billingStatus"],
          subscriptionStatus: subscriptionStatus as StoreType["subscriptionStatus"],
          renewalDate: renewalDate || undefined,
        },
      }).unwrap();
      toast.success("Billing updated");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update billing");
    }
  };

  const handleSaveTheme = async () => {
    if (!store) return;
    try {
      await changeTheme({
        id: store._id,
        data: {
          templateId: templateId || undefined,
          theme: { primaryColor, secondaryColor, font },
        },
      }).unwrap();
      toast.success("Theme updated");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to update theme");
    }
  };

  const tabs: { key: DrawerTab; label: string; icon: typeof Wrench }[] = [
    { key: "overview", label: "Overview", icon: Wrench },
    { key: "billing", label: "Billing", icon: CreditCard },
    { key: "theme", label: "Theme", icon: Palette },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-zinc-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Manage store</p>
              <h3 className="mt-0.5 text-lg font-bold text-zinc-900">{store.name}</h3>
            </div>
            <button onClick={onClose} className="rounded-xl border border-zinc-200 p-2 text-zinc-500 hover:bg-zinc-50 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-zinc-100 px-5 py-3">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    tab === t.key ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Overview */}
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Store name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Category</label>
                    <input value={category} onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500/20" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Status</label>
                  <select value={storeStatus} onChange={(e) => setStoreStatus(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none">
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <button onClick={handleSaveStore} disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />} Save changes
                </button>

                <div className="border-t border-zinc-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">Quick links</p>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`http://${store.subdomain || store.slug}.localhost:3000`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Storefront
                    </a>
                    <button onClick={() => router.push(`/dashboard/builder/${store._id}`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      <Palette className="h-3.5 w-3.5" /> Builder
                    </button>
                    <button onClick={() => router.push(`/dashboard/products?storeId=${store._id}`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      Products
                    </button>
                    <button onClick={() => router.push(`/dashboard/orders?storeId=${store._id}`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      Orders
                    </button>
                    <button onClick={() => router.push(`/dashboard/settings`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                      <CreditCard className="h-3.5 w-3.5" /> Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing */}
            {tab === "billing" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Current plan</p>
                      <h4 className="mt-1.5 text-xl font-bold text-zinc-900">
                        {selectedPlan?.name ?? (store.planId && typeof store.planId === "object" ? store.planId.name : store.plan)}
                      </h4>
                      <p className="mt-0.5 text-xs text-zinc-500">Renewal: {formatDate(renewalDate || store.renewalDate)}</p>
                    </div>
                    <p className="text-xl font-bold text-zinc-900">
                      {selectedPlan ? formatBDT(selectedPlan.priceBDT) : "BDT 0"}
                      <span className="text-xs font-normal text-zinc-400">/mo</span>
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses(billingStatus)}`}>
                      {billingStatus}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusClasses(subscriptionStatus)}`}>
                      {subscriptionStatus}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Plan</label>
                  <select value={planId} onChange={(e) => {
                    const next = plans.find((p) => p._id === e.target.value) ?? null;
                    setPlanId(e.target.value);
                    if (next && next.priceBDT > 0) {
                      setBillingStatus("active");
                      setSubscriptionStatus("active");
                    } else {
                      setBillingStatus("trial");
                      setSubscriptionStatus("trialing");
                    }
                  }} className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none">
                    <option value="">Legacy / unassigned</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} — {formatBDT(p.priceBDT)}/mo</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Billing status</label>
                    <select value={billingStatus} onChange={(e) => setBillingStatus(e.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none">
                      <option value="trial">Trial</option>
                      <option value="active">Active</option>
                      <option value="past_due">Past due</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Subscription</label>
                    <select value={subscriptionStatus} onChange={(e) => setSubscriptionStatus(e.target.value)}
                      className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none">
                      <option value="trialing">Trialing</option>
                      <option value="active">Active</option>
                      <option value="past_due">Past due</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Renewal date</label>
                  <input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none" />
                </div>

                <button onClick={handleSaveBilling} disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Save billing
                </button>
              </div>
            )}

            {/* Theme */}
            {tab === "theme" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Template</label>
                  <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none">
                    <option value="">Current template</option>
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Primary color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-10 rounded-xl border border-zinc-200 bg-white p-1 cursor-pointer" />
                      <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-xs focus:border-zinc-400 focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-600">Secondary color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-10 w-10 rounded-xl border border-zinc-200 bg-white p-1 cursor-pointer" />
                      <input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                        className="h-10 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-xs focus:border-zinc-400 focus:outline-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600">Font</label>
                  <select value={font} onChange={(e) => setFont(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-zinc-400 focus:outline-none">
                    {["Inter", "Roboto", "Poppins", "Playfair Display", "Space Grotesk", "Montserrat"].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSaveTheme} disabled={savingTheme}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                  {savingTheme ? <Loader2 className="h-4 w-4 animate-spin" /> : <Palette className="h-4 w-4" />} Save theme
                </button>
                <div className="border-t border-zinc-100 pt-4">
                  <button onClick={() => onDelete(store)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" /> Delete store
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
