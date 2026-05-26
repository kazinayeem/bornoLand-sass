"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Store, Globe, ExternalLink, Palette, Plus, ShoppingBag,
  Eye, Trash2, ChevronDown, Check, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUpdateStoreMutation, useChangeStoreThemeMutation } from "@/redux/api/store-api";
import { useGetTemplatesQuery } from "@/redux/api/template-api";
import { toast } from "sonner";
import type { Store as StoreType } from "@/redux/api/store-api";
import type { WorkspaceTabId } from "@/components/workspace/types";

type WorkspaceHeaderProps = {
  store: StoreType;
  activeTab: WorkspaceTabId;
  onTabChange: (tab: WorkspaceTabId) => void;
  onDeleteRequest: () => void;
  tabs: { id: WorkspaceTabId; label: string }[];
};

const planColors: Record<string, string> = {
  free: "bg-zinc-100 text-zinc-700",
  starter: "bg-blue-50 text-blue-700",
  growth: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700",
};

function getStoreUrl(store: StoreType) {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "bornoland.com";
  const subdomain = store.subdomain || store.slug;
  if (rootDomain.includes("localhost")) return `http://${subdomain}.localhost:3000`;
  return `https://${subdomain}.${rootDomain}`;
}

export function WorkspaceHeader({
  store, activeTab, onTabChange, onDeleteRequest, tabs,
}: WorkspaceHeaderProps) {
  const router = useRouter();
  const storeUrl = getStoreUrl(store);
  const [showActions, setShowActions] = useState(false);
  const [updateStore] = useUpdateStoreMutation();
  const [changeTheme] = useChangeStoreThemeMutation();
  const { data: templatesData } = useGetTemplatesQuery();
  const templates = templatesData?.data?.templates ?? [];

  const publishStore = async () => {
    try {
      const newStatus = store.status === "active" ? "draft" : "active";
      await updateStore({ id: store._id, data: { status: newStatus } }).unwrap();
      toast.success(newStatus === "active" ? "Store published!" : "Store unpublished");
    } catch {
      toast.error("Failed to update store status");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      {/* Gradient header */}
      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-blue-600 px-6 pt-6 pb-20 text-white">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black shadow-lg backdrop-blur-sm">
              {store.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{store.name}</h2>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  store.status === "active" ? "bg-emerald-500/30 text-emerald-100" : "bg-white/15 text-white/80"
                }`}>
                  {store.status}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${planColors[store.plan] ?? "bg-white/15 text-white/80"}`}>
                  {store.plan}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
                <Globe className="h-3.5 w-3.5" />
                <span>{storeUrl}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href={storeUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Visit
            </a>
            <button onClick={publishStore}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold backdrop-blur-sm transition-colors ${
                store.status === "active"
                  ? "bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}>
              {store.status === "active" ? <Eye className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {store.status === "active" ? "Published" : "Draft"}
            </button>
            <button
              onClick={() => router.push(`/dashboard/builder/${store._id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
              <Palette className="h-3.5 w-3.5" /> Builder
            </button>
            <div className="relative">
              <button onClick={() => setShowActions(!showActions)}
                className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-10 z-50 w-48 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl"
                  onMouseLeave={() => setShowActions(false)}>
                  {[
                    { icon: Plus, label: "Add Product", action: () => { onTabChange("products"); setShowActions(false); } },
                    { icon: ShoppingBag, label: "View Orders", action: () => { onTabChange("orders"); setShowActions(false); } },
                    { icon: Palette, label: "Customize Theme", action: () => { onTabChange("theme"); setShowActions(false); } },
                    { icon: Trash2, label: "Delete Store", action: () => { onDeleteRequest(); setShowActions(false); }, danger: true },
                  ].map((item) => (
                    <button key={item.label} onClick={item.action}
                      className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                        item.danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50"
                      }`}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="relative -mt-12 px-6">
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-white/90 backdrop-blur-sm border border-zinc-200/50 shadow-sm p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-zinc-100">
        <button onClick={() => onTabChange("products")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Product
        </button>
        <button onClick={() => router.push(`/dashboard/builder/${store._id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 transition-colors">
          <Palette className="h-3.5 w-3.5" /> Open Builder
        </button>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
          <ExternalLink className="h-3.5 w-3.5" /> Visit Store
        </a>
        <button onClick={publishStore}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition-colors">
          {store.status === "active" ? <Eye className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {store.status === "active" ? "Unpublish" : "Publish"}
        </button>
        <button onClick={() => onTabChange("orders")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors">
          <ShoppingBag className="h-3.5 w-3.5" /> View Orders
        </button>
      </div>
    </div>
  );
}
