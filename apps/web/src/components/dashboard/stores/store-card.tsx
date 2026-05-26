"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Store, Box, BarChart3, CreditCard, Globe, Palette, LayoutGrid,
  ShieldCheck, ChevronRight, MoreHorizontal, Copy, ExternalLink,
  Settings, Trash2, Wrench, ShoppingBag, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getStoreUrl } from "@/utils/domain";
import type { Store as StoreType, Plan } from "@/redux/api/store-api";

type StoreCardProps = {
  store: StoreType;
  plans: Plan[];
  index: number;
  onManage: (store: StoreType, tab: "overview" | "billing" | "theme") => void;
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

function getPlanName(plan: StoreType["planId"] | undefined, fallback: string) {
  if (plan && typeof plan === "object") return plan.name;
  return fallback;
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
  const storeUrl = getStoreUrl(store.subdomain || store.slug);
  const isActive = store.status === "active";
  const selectedPlan = plans.find((p) => p._id === (store.planId && typeof store.planId === "object" ? store.planId._id : ""));
  const subsPlan = plans.find((p) => p.slug === store.plan) ?? selectedPlan;

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
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-blue-600 p-5 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 text-lg font-black shadow-lg backdrop-blur-sm">
              {(store.name || "S").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold leading-tight truncate">{store.name}</h3>
              {store.category && (
                <p className="mt-0.5 text-xs text-white/70 truncate">{store.category}</p>
              )}
            </div>
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl">
                {[
                  { icon: ExternalLink, label: "Open storefront", action: () => window.open(storeUrl, "_blank") },
                  { icon: Copy, label: "Copy store URL", action: copyUrl },
                  { icon: LayoutGrid, label: "Open workspace", action: () => { setMenuOpen(false); router.push(`/dashboard/stores/${store._id}`); } },
                  { icon: Palette, label: "Open builder", action: () => { setMenuOpen(false); router.push(`/dashboard/builder/${store._id}`); } },
                  { icon: Trash2, label: "Delete store", action: () => { setMenuOpen(false); onDelete(store); }, danger: true },
                ].map((item) => (
                  <button key={item.label} onClick={item.action}
                    className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-zinc-700 hover:bg-zinc-50"
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

        <div className="relative mt-3 flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${isActive ? "bg-emerald-500/30 text-emerald-100" : "bg-white/15 text-white/80"}`}>
            {store.status}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusClasses(store.subscriptionStatus ?? store.billingStatus ?? store.status)}`}>
            {store.subscriptionStatus ?? store.billingStatus ?? store.status}
          </span>
        </div>
      </div>

      <div className="space-y-3.5 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
          <Globe className="h-3.5 w-3.5 shrink-0 text-blue-500" />
          <span className="truncate">{storeUrl}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Products", value: store.productCount ?? 0, icon: Box },
            { label: "Orders", value: store.orderCount ?? 0, icon: BarChart3 },
            { label: "Revenue", value: formatBDT(store.revenueBDT ?? 0), icon: CreditCard },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-zinc-50 p-2.5 text-center">
              <stat.icon className="mx-auto h-3.5 w-3.5 text-zinc-400" />
              <p className="mt-1 text-sm font-bold text-zinc-900">{stat.value}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
            <CreditCard className="h-3 w-3" /> {subsPlan?.name ?? planName}
          </span>
          {subsPlan && (
            <span className="text-[11px] font-medium text-zinc-400">
              {formatBDT(subsPlan.priceBDT)}/mo
            </span>
          )}
          {store.selectedTemplateId && typeof store.selectedTemplateId === "object" && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
              {store.selectedTemplateId.name}
            </span>
          )}
        </div>

        {store.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {store.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onManage(store, "overview")}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:bg-zinc-800"
          >
            <Wrench className="h-3.5 w-3.5" /> Manage
          </button>
          <button
            onClick={() => router.push(`/dashboard/stores/${store._id}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-50"
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Products
          </button>
          <button
            onClick={() => router.push(`/dashboard/stores/${store._id}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-50"
          >
            <CreditCard className="h-3.5 w-3.5" /> Dashboard
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400">
          <span>Renewal: {formatDate(store.renewalDate)}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/builder/${store._id}`)}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
            >
              <Palette className="h-3 w-3" /> Builder
            </button>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 hover:bg-zinc-200 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
