"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Box,
  BarChart3,
  CreditCard,
  Globe,
  Palette,
  LayoutGrid,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Trash2,
  Wrench,
  Eye,
  Calendar,
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
  const trialDays = getTrialDaysRemaining(store.trialEndsAt);

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
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
    >
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-800 to-zinc-700 p-5 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white/15 text-lg font-black shadow-lg backdrop-blur-sm">
              {store.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
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
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      item.action();
                      setMenuOpen(false);
                    }}
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
          <Badge variant={statusConfig.variant} className="bg-white/10 text-white ring-white/20">
            {statusConfig.label}
          </Badge>
          <Badge variant="primary" className="bg-white/10 text-white ring-white/20">
            {subsPlan?.name ?? planName}
          </Badge>
          {status === "trial" && trialDays !== null && (
            <span className="rounded-full bg-blue-500/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-100">
              {trialDays}d left
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3.5 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <span className="truncate">{storeUrl}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Revenue", value: formatBDT(store.revenueBDT ?? 0), icon: CreditCard },
            { label: "Orders", value: store.orderCount ?? 0, icon: BarChart3 },
            { label: "Products", value: store.productCount ?? 0, icon: Box },
            { label: "Visitors", value: "—", icon: Eye },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-zinc-50 p-2.5 text-center">
              <stat.icon className="mx-auto h-3.5 w-3.5 text-zinc-400" />
              <p className="mt-1 text-sm font-bold text-zinc-900">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {store.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{store.description}</p>
        )}

        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created {formatDate(store.createdAt)}
          </span>
          <span>Updated {formatDate(store.updatedAt)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onManage(store, "overview");
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Wrench className="h-3.5 w-3.5" />
            Manage
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/store/${store.slug}`);
            }}
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
