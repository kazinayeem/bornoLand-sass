"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import type { BuilderSection } from "@/redux/slices/builder-slice";
import { loadSections, setSaving } from "@/redux/slices/builder-slice";
import { useResetPageMutation } from "@/redux/api/builder-api";
import { motion } from "framer-motion";
import { RefreshCw, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  storeId: string;
  pageId: string;
  title: string;
  isHome: boolean;
  onSuccess?: () => void;
};

const DEFAULT_TEMPLATE = [
  { id: "hero-banner-1", type: "hero-banner", label: "Hero Banner", visible: true, props: { headline: "Welcome", subheadline: "Discover amazing products", buttonText: "Shop Now", buttonLink: "/shop", imageUrl: "", overlayColor: "rgba(15, 23, 42, 0.45)", textAlignment: "left", heroHeight: "md", kicker: "Welcome" } },
  { id: "featured-products-1", type: "featured-products", label: "Featured Products", visible: true, props: { title: "Featured Products", subtitle: "Our best selling items", gridColumns: "4", showBadges: "true", showRatings: "true" } },
  { id: "newsletter-1", type: "newsletter", label: "Newsletter", visible: true, props: { headline: "Stay in the Loop", subheadline: "Subscribe for exclusive deals.", buttonText: "Subscribe", placeholderText: "Enter your email" } },
  { id: "simple-footer-1", type: "simple-footer", label: "Footer", visible: true, props: { copyright: "© 2026 Your Store. All rights reserved.", showSocial: "true" } },
];

export function ResetPageDialog({ open, onClose, storeId, pageId, title, isHome, onSuccess }: Props) {
  const dispatch = useDispatch();
  const [resetPage] = useResetPageMutation();
  const [resetting, setResetting] = useState(false);

  if (!open) return null;

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetPage({ storeId, pageId }).unwrap();
      dispatch(setSaving(false));
      dispatch(loadSections(DEFAULT_TEMPLATE.map((s) => ({ ...s, id: `${s.type}-${Date.now()}` })) as unknown as BuilderSection[]));
      onSuccess?.();
      onClose();
    } catch {
      setResetting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <RefreshCw className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-zinc-900">Reset &ldquo;{title}&rdquo; to template?</h3>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              All current sections will be replaced with the default template (Hero, Featured Products, Newsletter, Footer). 
              This action can be undone with <kbd className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] font-medium text-zinc-600">⌘Z</kbd>.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={resetting}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
            {resetting ? "Resetting..." : "Reset to Template"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
