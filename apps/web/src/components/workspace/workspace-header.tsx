"use client";

import { Globe, ExternalLink, Palette, Eye, X, Check, ChevronDown, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUpdateStoreMutation } from "@/redux/api/store-api";
import { toast } from "sonner";
import { revalidateStorefrontForStore } from "@/lib/revalidate-storefront-client";
import { getStoreUrl } from "@/lib/urls";
import type { Store as StoreType } from "@/redux/api/store-api";
import type { WorkspaceTabId } from "@/components/workspace/types";

import { useLanguage } from "@/providers/language-provider";

type WorkspaceHeaderProps = {
  store: StoreType;
  onSettings: () => void;
  onBuilder: () => void;
};

export function WorkspaceHeader({ store, onSettings, onBuilder }: WorkspaceHeaderProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const router = useRouter();
  const storeUrl = getStoreUrl(store.subdomain || store.slug);
  const [updateStore] = useUpdateStoreMutation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleStatus = async () => {
    try {
      const newStatus = store.status === "active" ? "draft" : "active";
      await updateStore({ id: store._id, data: { status: newStatus } }).unwrap();
      await revalidateStorefrontForStore(store, { scope: "all" });
      toast.success(
        isBn
          ? newStatus === "active"
            ? "দোকান প্রকাশিত হয়েছে!"
            : "দোকান অপ্রকাশিত করা হয়েছে"
          : newStatus === "active"
            ? "Store published!"
            : "Store unpublished"
      );
    } catch {
      toast.error(isBn ? "স্ট্যাটাস পরিবর্তন করা যায়নি" : "Failed to update store status");
    }
  };

  return (
    <div className="flex h-16 items-center justify-between rounded-apple-lg border border-apple-hairline bg-apple-canvas px-5">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-apple-lg bg-apple-ink text-sm font-bold text-apple-on-dark">
          {store.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-apple-ink truncate">{store.name}</h2>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${store.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-apple-canvas-parchment text-apple-ink-muted-48"}`}>
              {store.status === "active" ? (isBn ? "সক্রিয়" : "Active") : (isBn ? "খসড়া" : "Draft")}
            </span>
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              {store.plan}
            </span>
          </div>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-apple-ink-muted-48 hover:text-blue-600 transition-colors">
            <Globe className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{storeUrl}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <a href={storeUrl} target="_blank" rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-apple-hairline px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors">
          <ExternalLink className="h-3.5 w-3.5" /> {isBn ? "ভিজিট করুন" : "Visit"}
        </a>
        <button onClick={onBuilder}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-apple-hairline px-3 py-1.5 text-xs font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment transition-colors">
          <Palette className="h-3.5 w-3.5" /> {isBn ? "বিল্ডার" : "Builder"}
        </button>
        <button onClick={toggleStatus}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            store.status === "active"
              ? "border border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
              : "bg-apple-ink text-white hover:bg-apple-ink-muted-80"
          }`}>
          {store.status === "active" ? <Eye className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
          {store.status === "active" ? (isBn ? "আনপাবলিশ" : "Unpublish") : (isBn ? "পাবলিশ" : "Publish")}
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-apple-hairline p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-apple-hairline bg-white py-1.5 shadow-xl"
              onMouseLeave={() => setMenuOpen(false)}>
              <button onClick={() => { router.push(`/dashboard/stores/${store._id}`); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">
                <ShoppingBag className="h-3.5 w-3.5" /> {isBn ? "অর্ডার দেখুন" : "View Orders"}
              </button>
              <button onClick={() => { onSettings(); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-apple-ink-muted-80 hover:bg-apple-canvas-parchment">
                <Palette className="h-3.5 w-3.5" /> {isBn ? "সেটিংস" : "Settings"}
              </button>
              <div className="border-t border-apple-divider-soft my-1" />
              <button onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" /> {isBn ? "দোকান মুছে ফেলুন" : "Delete Store"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
