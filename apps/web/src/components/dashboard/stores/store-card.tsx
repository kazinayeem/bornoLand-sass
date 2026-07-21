"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Box,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Globe,
  HardDrive,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Archive,
  Users,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { Store as StoreType, Plan } from "@/redux/api/store-api";
import { Badge } from "@/components/ui/badge";
import {
  formatBDT,
  getStoreUrl,
  resolveStoreStatus,
  storeStatusConfig,
  getTrialDaysRemaining,
  type StoreStatus,
} from "@/lib/store-status";
import { STORE_TYPES } from "@/lib/store-types";
import { useUpdateStoreMutation } from "@/redux/api/store-api";
import { DropdownMenu, type DropdownItem } from "@/components/ui/dropdown-menu";

type StoreCardProps = {
  store: StoreType;
  plans: Plan[];
  index: number;
  onManage: (store: StoreType, tab?: "overview" | "billing" | "theme") => void;
  onDelete: (store: StoreType) => void;
};

function getPlanName(plan: StoreType["planId"] | undefined, fallback: string) {
  if (plan && typeof plan === "object") return plan.name;
  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBytes(usedBytes: number, limitBytes: number) {
  const usedMB = usedBytes / (1024 * 1024);
  const limitMB = limitBytes / (1024 * 1024);
  const usedText = usedMB >= 1024 ? `${(usedMB / 1024).toFixed(1)} GB` : `${Math.round(usedMB)} MB`;
  const limitText = limitMB >= 1024 ? `${(limitMB / 1024).toFixed(1)} GB` : `${Math.round(limitMB)} MB`;
  const percent = limitBytes > 0 ? Math.min(100, Math.round((usedBytes / limitBytes) * 100)) : 0;
  return { text: `${usedText} / ${limitText}`, percent };
}

function getStoreTypeLabel(storeType?: string) {
  return STORE_TYPES.find((t) => t.id === storeType)?.label ?? "Ecommerce";
}

function getDaysRemainingText(store: StoreType): { text: string; urgent: boolean; expired: boolean } {
  const status = resolveStoreStatus(store);

  if (status === "pending_payment" || status === "pending_approval") {
    return { text: "Awaiting Approval", urgent: false, expired: false };
  }

  if (status === "expired") {
    const endsAt = store.trialEndsAt;
    if (endsAt) {
      const diff = Date.now() - new Date(endsAt).getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return { text: "Expired Today", urgent: true, expired: true };
      return { text: `Expired ${days}d ago`, urgent: true, expired: true };
    }
    return { text: "Expired", urgent: true, expired: true };
  }

  if (status === "suspended") {
    return { text: "Suspended", urgent: true, expired: true };
  }

  if (status === "active") {
    if (store.renewalDate) {
      const diff = new Date(store.renewalDate).getTime() - Date.now();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return { text: "Renewal Due", urgent: true, expired: false };
      if (days <= 7) return { text: `${days}d to renew`, urgent: true, expired: false };
      return { text: `${days} days left`, urgent: false, expired: false };
    }
    return { text: "Active", urgent: false, expired: false };
  }

  if (status === "trial") {
    const days = getTrialDaysRemaining(store.trialEndsAt);
    if (days === null) return { text: "Trial", urgent: false, expired: false };
    if (days <= 0) return { text: "Trial Expired", urgent: true, expired: true };
    if (days <= 3) return { text: `${days}d left`, urgent: true, expired: false };
    return { text: `${days} days left`, urgent: false, expired: false };
  }

  return { text: "—", urgent: false, expired: false };
}

/* ── Status pill in card header ─────────────────────────── */
function ExpiryPill({ store }: { store: StoreType }) {
  const status = resolveStoreStatus(store);
  const info = getDaysRemainingText(store);

  if (status === "pending_payment" || status === "pending_approval") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
        <Clock className="h-2.5 w-2.5" /> Awaiting
      </span>
    );
  }
  if (info.expired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-red-300 ring-1 ring-red-400/30">
        <AlertTriangle className="h-2.5 w-2.5" /> {info.text}
      </span>
    );
  }
  if (info.urgent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-400/30">
        <Clock className="h-2.5 w-2.5" /> {info.text}
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
        <CheckCircle2 className="h-2.5 w-2.5" /> {info.text}
      </span>
    );
  }
  if (status === "trial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300 ring-1 ring-blue-400/30">
        <Sparkles className="h-2.5 w-2.5" /> {info.text}
      </span>
    );
  }
  return null;
}

/* ── Status dot colour for the status badge ─────────────── */
function statusDotClass(status: StoreStatus) {
  switch (status) {
    case "active": return "bg-emerald-400";
    case "trial": return "bg-blue-400";
    case "expired": return "bg-red-400";
    case "suspended": return "bg-orange-400";
    case "pending_payment":
    case "pending_approval": return "bg-amber-400";
    default: return "bg-zinc-400";
  }
}

/* ── Gradient per status ─────────────────────────────────── */
function headerGradient(status: StoreStatus) {
  switch (status) {
    case "active":   return "from-[#0f172a] via-[#1e293b] to-[#334155]";
    case "trial":    return "from-[#1e1b4b] via-[#312e81] to-[#4338ca]";
    case "expired":  return "from-[#450a0a] via-[#7f1d1d] to-[#991b1b]";
    case "suspended":return "from-[#431407] via-[#7c2d12] to-[#9a3412]";
    case "pending_payment":
    case "pending_approval": return "from-[#451a03] via-[#92400e] to-[#b45309]";
    default:         return "from-[#18181b] via-[#27272a] to-[#3f3f46]";
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  Main component                                              */
/* ─────────────────────────────────────────────────────────── */
export function StoreCard({ store, plans, index, onManage, onDelete }: StoreCardProps) {
  const router = useRouter();
  const [updateStore] = useUpdateStoreMutation();

  const planName = getPlanName(store.planId, store.plan);
  const storeUrl = getStoreUrl(store);
  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const selectedPlan = plans.find(
    (p) => p._id === (store.planId && typeof store.planId === "object" ? store.planId._id : "")
  );
  const subsPlan = plans.find((p) => p.slug === store.plan) ?? selectedPlan;
  const isExpired = status === "expired";
  const isPending = status === "pending_payment" || status === "pending_approval";
  const domain = store.subdomain ? `${store.subdomain}.bornoland.com` : `${store.slug}.bornoland.com`;
  const limitBytes = store.storageLimitBytes ?? 0;
  const storage = formatBytes(store.storageUsedBytes ?? 0, limitBytes);
  const showStorage = limitBytes > 0;

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Store URL copied to clipboard");
  };

  const handleArchive = async () => {
    try {
      await updateStore({ id: store._id, data: { status: "archived" } }).unwrap();
      toast.success(`"${store.name}" has been archived`);
    } catch {
      toast.error("Failed to archive store");
    }
  };

  const menuItems: DropdownItem[] = [
    { icon: ExternalLink, label: "Open Storefront", onClick: () => window.open(storeUrl, "_blank") },
    { icon: Copy,        label: "Copy URL",        onClick: copyUrl },
    { icon: Pencil,      label: "Edit Store",      onClick: () => onManage(store, "overview") },
    { icon: CreditCard,  label: "Billing",         onClick: () => router.push(`/store/${store.slug}/billing`) },
    { icon: BarChart3,   label: "Analytics",       onClick: () => router.push(`/store/${store.slug}/analytics`) },
    { icon: Layers,      label: "Duplicate Store", onClick: () => toast.info("Duplicate Store — coming soon") },
    { divider: true },
    { icon: Archive,     label: "Archive Store",   onClick: handleArchive,              warning: true },
    { icon: Trash2,      label: "Delete Store",    onClick: () => onDelete(store),      danger: true },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 hover:ring-zinc-900/10"
    >
      {/* ── Glossy header ──────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${headerGradient(status)} p-5`}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-white/3 blur-xl" />

        {/* Top row: logo + name + menu */}
        <div className="relative flex items-start justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10 ring-2 ring-white/20 shadow-lg">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-base font-black text-white">
                  {(store.name || "S").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold leading-tight text-white">
                {store.name}
              </h3>
              <p className="mt-0.5 truncate text-xs text-white/60">
                {getStoreTypeLabel(store.storeType)}
              </p>
            </div>
          </div>

          {/* More menu — portal-based, never clipped by overflow:hidden header */}
          <DropdownMenu
            placement="bottom-end"
            trigger={
              <button
                type="button"
                id={`store-menu-${store._id}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={menuItems}
          />
        </div>

        {/* Status + Plan badges */}
        <div className="relative mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white bg-white/15 ring-1 ring-white/20`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} />
            {statusConfig.label}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/20">
            {subsPlan?.name ?? planName}
          </span>
          <ExpiryPill store={store} />
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Domain */}
        <div className="flex items-center gap-2 rounded-lg bg-apple-canvas-parchment px-3 py-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-apple-ink-muted-48" />
          <span className="truncate text-xs font-medium text-apple-ink-muted-80">{domain}</span>
        </div>

        {/* Stats grid: Products · Orders · Revenue · Customers */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Products", value: store.productCount ?? 0,            icon: Box,          color: "text-violet-500" },
            { label: "Orders",   value: store.orderCount ?? 0,              icon: ShoppingCart,  color: "text-blue-500"   },
            { label: "Revenue",  value: formatBDT(store.revenueBDT ?? 0),   icon: TrendingUp,    color: "text-emerald-500" },
            { label: "Staff",    value: store.staffCount ?? 0,              icon: Users,         color: "text-amber-500"  },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5 rounded-xl bg-apple-canvas-parchment px-1.5 py-2.5 text-center">
              <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              <p className="mt-0.5 text-sm font-bold text-apple-ink leading-none">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-apple-ink-muted-48">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Storage bar */}
        {showStorage && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-apple-ink-muted-48">
                <HardDrive className="h-3 w-3" /> Storage
              </span>
              <span className="text-[11px] font-semibold text-apple-ink-muted-80">{storage.text}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${storage.percent}%` }}
                transition={{ delay: index * 0.04 + 0.3, duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  storage.percent > 80 ? "bg-red-500" :
                  storage.percent > 60 ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </div>
          </div>
        )}

        {/* Date info */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {[
            { icon: Calendar,     label: "Created",  value: formatDate(store.createdAt) },
            { icon: Clock,        label: "Updated",  value: formatDate(store.updatedAt) },
            {
              icon: isExpired ? AlertTriangle : RefreshCcw,
              label: isExpired ? "Expired" : "Renews",
              value: formatDate(store.renewalDate ?? store.trialEndsAt),
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-1.5">
              <row.icon className={`h-3 w-3 shrink-0 ${row.label === "Expired" ? "text-red-400" : "text-apple-ink-muted-48"}`} />
              <span className="truncate text-[10px] text-apple-ink-muted-48">
                <span className="font-medium text-apple-ink-muted-80">{row.label}: </span>{row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Quick action buttons */}
        <div className="border-t border-zinc-100 pt-3">
          {/* Primary actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => window.open(storeUrl, "_blank")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Store
            </button>
            <button
              type="button"
              onClick={() => router.push(`/store/${store.slug}/dashboard`)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-semibold text-apple-ink-muted-80 transition-all hover:bg-apple-canvas-parchment active:scale-95"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Dashboard
            </button>
          </div>

          {/* Secondary action strip */}
          <div className="mt-2 flex items-center gap-1">
            {[
              { id: "edit",     Icon: Pencil,      label: "Edit",     action: () => onManage(store, "overview"),                    cls: "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200" },
              { id: "billing",  Icon: CreditCard,   label: "Billing",  action: () => router.push(`/store/${store.slug}/billing`),    cls: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200" },
              { id: "analytics",Icon: BarChart3,    label: "Analytics",action: () => router.push(`/store/${store.slug}/analytics`),  cls: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" },
              { id: "duplicate",Icon: Layers,       label: "Duplicate",action: () => toast.info("Duplicate Store — coming soon"),    cls: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200" },
              { id: "archive",  Icon: Archive,      label: "Archive",  action: handleArchive,                                        cls: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200" },
              { id: "delete",   Icon: Trash2,       label: "Delete",   action: () => onDelete(store),                                cls: "hover:bg-red-50 hover:text-red-600 hover:border-red-200" },
            ].map(({ id, Icon, label, action, cls }) => (
              <button
                key={id}
                type="button"
                title={label}
                onClick={action}
                className={`group/btn relative flex h-8 flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white text-apple-ink-muted-48 transition-all duration-150 active:scale-95 ${cls}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover/btn:opacity-100 z-10">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
