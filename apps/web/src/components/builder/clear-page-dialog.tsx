"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { loadSections, setSaving } from "@/redux/slices/builder-slice";
import { useSaveStorePageDraftMutation } from "@/redux/api/store-page-api";
import { useRequiredStore } from "@/providers/store-context";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ClearPageDialog({ open, onClose }: Props) {
  const dispatch = useDispatch();
  const { storeId } = useRequiredStore();
  const pageId = useSelector((s: RootState) => s.builder.page.id);
  const sections = useSelector((s: RootState) => s.builder.sections);
  const [saveDraft] = useSaveStorePageDraftMutation();
  const [clearing, setClearing] = useState(false);

  if (!open) return null;

  const handleClear = async () => {
    if (!pageId || !storeId) return;
    setClearing(true);
    try {
      await saveDraft({ id: pageId, storeId, sections: [], headerSections: [], footerSections: [] }).unwrap();
      dispatch(setSaving(false));
      dispatch(loadSections([]));
      onClose();
    } catch {
      setClearing(false);
    }
  };

  const sectionCount = sections.length;

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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-apple-ink">Clear page?</h3>
            <p className="mt-1 text-sm leading-6 text-apple-ink-muted-48">
              This will remove all {sectionCount} section{sectionCount !== 1 ? "s" : ""} from the page. The page title, slug, SEO, and navigation will be preserved. This action can be undone with <kbd className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] font-medium text-apple-ink-muted-80">⌘Z</kbd>.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={clearing}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleClear}
            disabled={clearing}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {clearing && <Loader2 className="h-4 w-4 animate-spin" />}
            {clearing ? "Clearing..." : "Clear page"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
