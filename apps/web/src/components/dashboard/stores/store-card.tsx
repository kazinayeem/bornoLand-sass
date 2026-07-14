"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Box,
  BarChart3,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Trash2,
  LayoutGrid,
  Palette,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  CreditCard,
  HardDrive,
  Users,
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

type StoreCardProps = {
  store: StoreType;
  plans: Plan[];
  index: number;
  onManage: (store: StoreType, tab: "overview" | "billing" | "theme") => void;
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

function getStoreTypeLabel(storeType?: string) {
  return STORE_TYPES.find((t) => t.id === storeType)?.label ?? "Ecommerce";
}

function getDaysRemainingText(store: StoreType): { text: string; urgent: boolean; expired: boolean } {
  const status = resolveStoreStatus(store);

  if (status === "pending_payment" || status === "pending_approval") {
    return { text: "Waiting Approval", urgent: false, expired: false };
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
      if (days <= 7) return { text: `${days}d left`, urgent: true, expired: false };
      return { text: `${days} Days Left`, urgent: false, expired: false };
    }
    return { text: "Active", urgent: false, expired: false };
  }

  if (status === "trial") {
    const days = getTrialDaysRemaining(store.trialEndsAt);
    if (days === null) return { text: "Trial", urgent: false, expired: false };
    if (days <= 0) return { text: "Trial Expired", urgent: true, expired: true };
    if (days <= 3) return { text: `${days}d left`, urgent: true, expired: false };
    return { text: `${days} Days Left`, urgent: false, expired: false };
  }

  return { text: "—", urgent: false, expired: false };
}

function DaysBadge({ store }: { store: StoreType }) {
  const status = resolveStoreStatus(store);

  if (status === "pending_payment" || status === "pending_approval") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3 w-3" />
        Awaiting Approval
      </span>
    );
  }

  const info = getDaysRemainingText(store);
  if (info.expired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
        <AlertTriangle className="h-3 w-3" />
        {info.text}
      </span>
    );
  }
  if (info.urgent) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
        <Clock className="h-3 w-3" />
        {info.text}
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        {info.text}
      </span>
    );
  }
  if (status === "trial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
        <Clock className="h-3 w-3" />
        {info.text}
      </span>
    );
  }
  return null;
}

export function StoreCard({ store, plans, index, onManage, onDelete }: StoreCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const planName = getPlanName(store.planId, store.plan);
  const storeUrl = getStoreUrl(store);
  const status = resolveStoreStatus(store);
  const statusConfig = storeStatusConfig[status];
  const selectedPlan = plans.find((p) => p._id === (store.planId && typeof store.planId === "object" ? store.planId._id : ""));
  const subsPlan = plans.find((p) => p.slug === store.plan) ?? selectedPlan;
  const daysInfo = getDaysRemainingText(store);

  const isActionable = status === "active" || status === "trial";
  const isExpired = status === "expired";
  const isPending = status === "pending_payment" || status === "pending_approval";

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Store URL copied");
    setMenuOpen(false);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isPending
          ? "border-amber-200/80 bg-white shadow-amber-100/30"
          : isExpired
          ? "border-red-200/80 bg-white shadow-red-100/30"
          : "border-zinc-200/80 bg-white shadow-sm hover:border-zinc-300"
      }`}
    >
      {/* Header gradient */}
      <div
        className={`relative h-28 overflow-hidden p-5 text-white ${
          isPending
            ? "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-500"
            : isExpired
            ? "bg-gradient-to-br from-red-700 via-red-600 to-red-500"
            : "bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-700"
        }`}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white/15 text-lg font-black shadow-lg backdrop-blur-sm">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (store.name || "S").slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold leading-tight">{store.name}</h3>
              <p className="mt-0.5 truncate text-xs text-white/70">{getStoreTypeLabel(store.storeType)}</p>
            </div>
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-white/20"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl">
                {[
                  { icon: ExternalLink, label: "Open storefront", action: () => window.open(storeUrl, "_blank") },
                  { icon: Copy, label: "Copy store URL", action: copyUrl },
                  { icon: LayoutGrid, label: "Open dashboard", action: () => router.push(`/store/${store.slug}`) },
                  { icon: Palette, label: "Open builder", action: () => router.push(`/store/${store.slug}/builder`) },
                  { icon: Trash2, label: "Delete store", action: () => onDelete(store), danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); item.action(); setMenuOpen(false); }}
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                      item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={statusConfig.variant} className="bg-white/15 text-white ring-white/20 border-0">
            {statusConfig.label}
          </Badge>
          <Badge variant="primary" className="bg-white/15 text-white ring-white/20 border-0">
            {subsPlan?.name ?? planName}
          </Badge>
          <DaysBadge store={store} />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3.5 p-4">
        {/* Plan info bar */}
        <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-xs">
          <span className="text-zinc-500">
            {subsPlan && !subsPlan.isCustomPrice ? `${formatBDT(subsPlan.priceBDT ?? 0)}/mo` : "—"}
          </span>
          <span className="text-zinc-500">
            {store.renewalDate ? `Renewal: ${formatDate(store.renewalDate)}` : ""}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Storage", value: store.storageUsed ? `${Math.round(store.storageUsed / (1024 * 1024))}MB` : "0MB", icon: HardDrive },
            { label: "Products", value: store.productCount ?? 0, icon: Box },
            { label: "Staff", value: store.staffCount ?? 0, icon: Users },
            { label: "Orders", value: store.orderCount ?? 0, icon: BarChart3 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-zinc-50 p-2 text-center">
              <stat.icon className="mx-auto h-3.5 w-3.5 text-zinc-400" />
              <p className="mt-1 text-sm font-bold text-zinc-900">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Created date */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <Calendar className="h-3 w-3" />
          Created {formatDate(store.createdAt)}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => router.push(`/store/${store.slug}/billing`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800"
          >
            {isExpired ? (
              <><RefreshCcw className="h-3.5 w-3.5" /> Renew</>
            ) : isPending ? (
              <><Clock className="h-3.5 w-3.5" /> Pending</>
            ) : (
              <><CreditCard className="h-3.5 w-3.5" /> Manage</>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/store/${store.slug}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Open Dashboard
          </button>
        </div>
      </div>
    </motion.article>
  );
}
