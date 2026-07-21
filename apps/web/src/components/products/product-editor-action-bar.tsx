"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Eye,
  Save,
  Trash2,
} from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";

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
  duplicating?: boolean;
  deleting?: boolean;
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
  duplicating = false,
  deleting = false,
}: ProductEditorActionBarProps) {
  const previewHref = productId ? `/products/${productId}` : undefined;
  const isBusy = saving || duplicating || deleting;

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-apple-ink">{title}</h1>
            <p className="text-xs text-apple-ink-muted-48" aria-live="polite">
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
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-apple-hairline px-3 text-caption text-apple-ink-muted-80 transition hover:bg-apple-canvas-parchment"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Link>
          )}
          {onDuplicate && (
            <LoadingButton
              type="button"
              variant="outline"
              size="sm"
              loading={duplicating}
              loadingKey="create"
              onClick={onDuplicate}
              disabled={isBusy}
              icon={<Copy className="h-4 w-4" />}
              className="rounded-xl"
            >
              Duplicate
            </LoadingButton>
          )}
          {onDelete && (
            <LoadingButton
              type="button"
              variant="danger"
              size="sm"
              loading={deleting}
              loadingKey="delete"
              onClick={onDelete}
              disabled={isBusy}
              icon={<Trash2 className="h-4 w-4" />}
              className="rounded-xl"
            >
              Delete
            </LoadingButton>
          )}
          <LoadingButton
            type="button"
            variant="outline"
            size="sm"
            loading={saving}
            loadingKey="save"
            onClick={onSaveDraft}
            disabled={isBusy}
            icon={<Save className="h-4 w-4" />}
            className="rounded-xl"
          >
            Save Draft
          </LoadingButton>
          <LoadingButton
            type="button"
            variant="primary"
            size="sm"
            loading={saving}
            loadingKey="publish"
            onClick={onPublish}
            disabled={isBusy}
            icon={<ExternalLink className="h-4 w-4" />}
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800"
          >
            Publish
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
