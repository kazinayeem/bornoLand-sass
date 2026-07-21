"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, X, Trash2, Loader2, FileText,
} from "lucide-react";
import {
  useCheckPageNavigationUsageQuery,
} from "@/redux/api/navigation-api";
import type { StorePage } from "@/redux/api/store-page-api";
import { toast } from "sonner";

type Props = {
  page: StorePage;
  storeId: string;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
};

export function NavConflictDialog({ page, storeId, onClose, onConfirmDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const { data, isLoading } = useCheckPageNavigationUsageQuery(
    { storeId, pageSlug: page.slug },
    { skip: !storeId || !page.slug }
  );

  const usedIn = data?.data?.usedIn ?? [];
  const hasConflicts = usedIn.length > 0;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirmDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-apple-lg border border-apple-hairline bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-apple-ink">
              Delete &ldquo;{page.title}&rdquo;?
            </h2>
            <p className="mt-1 text-sm text-apple-ink-muted-48">
              This page will be moved to trash. {hasConflicts
                ? "It is referenced in navigations and may break links."
                : "It is not referenced in any navigation."}
            </p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-apple-canvas-parchment shrink-0">
            <X className="h-4 w-4 text-apple-ink-muted-48" />
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-apple-canvas-parchment px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-apple-ink-muted-48" />
            <span className="text-xs text-apple-ink-muted-48">Checking navigation usage...</span>
          </div>
        )}

        {/* Conflicts list */}
        {!isLoading && hasConflicts && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-apple-ink-muted-80 uppercase tracking-wider">
              Used in {usedIn.length} navigation {usedIn.length === 1 ? "item" : "items"}
            </p>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              {usedIn.map((ref, i) => (
                <div key={`${ref.navigationId}-${i}`} className="flex items-center gap-2.5">
                  <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-amber-800 truncate">
                      {ref.menuItemLabel}
                    </p>
                    <p className="text-[10px] text-amber-600">
                      in {ref.navigationLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-apple-ink-muted-48">
              If you delete this page, these navigation links will break.
            </p>
          </div>
        )}

        {!isLoading && !hasConflicts && (
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
            <p className="text-xs font-medium text-emerald-700">
              No navigation items reference this page. Safe to delete.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-apple-hairline px-4 py-2 text-sm font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? "Moving to Trash..." : "Move to Trash"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
