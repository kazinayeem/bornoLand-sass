"use client";

import { Globe, ExternalLink, Palette, Eye, X, Check, ChevronDown, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateStoreMutation } from "@/redux/api/store-api";
import { toast } from "sonner";
import { getStoreUrl } from "@/utils/domain";
import type { Store as StoreType } from "@/redux/api/store-api";
import type { WorkspaceTabId } from "@/components/workspace/types";

type WorkspaceHeaderProps = {
  store: StoreType;
  onSettings: () => void;
  onBuilder: () => void;
};

export function WorkspaceHeader({ store, onSettings, onBuilder }: WorkspaceHeaderProps) {
  const router = useRouter();
  const storeUrl = getStoreUrl(store.subdomain || store.slug);
  const [updateStore] = useUpdateStoreMutation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleStatus = async () => {
    try {
      const newStatus = store.status === "active" ? "draft" : "active";
      await updateStore({ id: store._id, data: { status: newStatus } }).unwrap();
      toast.success(newStatus === "active" ? "Store published!" : "Store unpublished");
    } catch {
      toast.error("Failed to update store status");
    }
  };

  return (
    <div className="flex h-16 items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-blue-600 text-sm font-bold text-white shadow-sm">
          {store.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 truncate">{store.name}</h2>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${store.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
              {store.status}
            </span>
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              {store.plan}
            </span>
          </div>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-600 transition-colors">
            <Globe className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{storeUrl}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a href={storeUrl} target="_blank" rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <ExternalLink className="h-3.5 w-3.5" /> Visit
        </a>
        <button onClick={onBuilder}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
          <Palette className="h-3.5 w-3.5" /> Builder
        </button>
        <button onClick={toggleStatus}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            store.status === "active"
              ? "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              : "bg-zinc-900 text-white hover:bg-zinc-800"
          }`}>
          {store.status === "active" ? <Eye className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {store.status === "active" ? "Unpublish" : "Publish"}
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-zinc-200 p-1.5 text-zinc-400 hover:bg-zinc-50 transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-zinc-200 bg-white py-1.5 shadow-xl"
              onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { router.push(`/dashboard/stores/${store._id}`); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
                <ShoppingBag className="h-3.5 w-3.5" /> View Orders
              </button>
              <button onClick={() => { onSettings(); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-zinc-700 hover:bg-zinc-50">
                <Palette className="h-3.5 w-3.5" /> Settings
              </button>
              <div className="border-t border-zinc-100 my-1" />
              <button onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> Delete Store
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
