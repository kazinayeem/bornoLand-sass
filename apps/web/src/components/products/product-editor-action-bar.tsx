"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";

type ProductEditorActionBarProps = {
  title: string;
  backHref: string;
  saving: boolean;
  autoSaveStatus: "idle" | "saving" | "saved" | "error";
  isDirty: boolean;
  productId?: string;
  storeSlug: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onBack: () => void;
};

export function ProductEditorActionBar({
  title,
  backHref,
  saving,
  autoSaveStatus,
  isDirty,
  productId,
  storeSlug,
  onSaveDraft,
  onPublish,
  onDuplicate,
  onDelete,
  onBack,
}: ProductEditorActionBarProps) {
  const previewHref = productId ? `/products/${productId}` : undefined;

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-zinc-900">{title}</h1>
            <p className="text-xs text-zinc-500">
              {autoSaveStatus === "saving" && "Saving…"}
              {autoSaveStatus === "saved" && "All changes saved"}
              {autoSaveStatus === "error" && "Auto-save failed"}
              {autoSaveStatus === "idle" && isDirty && "Unsaved changes"}
              {autoSaveStatus === "idle" && !isDirty && "Up to date"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {previewHref && (
            <Link
              href={previewHref}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          )}
          {onDuplicate && (
            <button
              type="button"
              onClick={onDuplicate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
