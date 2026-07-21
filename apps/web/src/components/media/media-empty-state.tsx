"use client";

import { motion } from "framer-motion";
import { CloudUpload, Upload, HardDrive, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

type LimitType = "no-storage" | "storage-full" | "feature-disabled" | "none";

type MediaEmptyStateProps = {
  onUpload?: () => void;
  dragOver?: boolean;
  limitType?: LimitType;
  limitMessage?: string;
  billingHref?: string;
};

export function MediaEmptyState({
  onUpload,
  dragOver,
  limitType = "none",
  limitMessage,
  billingHref,
}: MediaEmptyStateProps) {
  if (limitType === "no-storage") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-apple-hairline px-6 py-20 text-center bg-apple-canvas-parchment"
      >
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-500 text-white">
            <Ban className="h-9 w-9" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-apple-canvas ring-1 ring-apple-divider-soft">
            <HardDrive className="h-4 w-4 text-apple-ink-muted-48" />
          </div>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-apple-ink">Media storage not included</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-apple-ink-muted-48">
          {limitMessage ?? "Your current plan does not include media storage. Upgrade to upload and manage files."}
        </p>
        {billingHref && (
          <Button
            onClick={() => window.open(billingHref, "_blank")}
            className="mt-8 rounded-xl"
          >
            Upgrade Plan
          </Button>
        )}
        <p className="mt-4 text-xs text-apple-ink-muted-48">JPG, PNG, WEBP, SVG, GIF, PDF, DOCX, MP4, ZIP</p>
      </motion.div>
    );
  }

  if (limitType === "storage-full") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-200 px-6 py-20 text-center bg-amber-50/50"
      >
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-amber-500 text-white">
            <HardDrive className="h-9 w-9" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-apple-canvas ring-1 ring-amber-100">
            <Ban className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-apple-ink">Storage limit reached</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-apple-ink-muted-48">
          {limitMessage ?? "You have used all available media storage for your current plan."}
        </p>
        {billingHref && (
          <Button
            onClick={() => window.open(billingHref, "_blank")}
            className="mt-8 rounded-xl"
          >
            Upgrade Plan
          </Button>
        )}
        <p className="mt-4 text-xs text-apple-ink-muted-48">Delete files or upgrade to continue uploading.</p>
      </motion.div>
    );
  }

  if (limitType === "feature-disabled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-apple-hairline px-6 py-20 text-center bg-apple-canvas-parchment"
      >
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-500 text-white">
            <Ban className="h-9 w-9" />
          </div>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-apple-ink">Media feature unavailable</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-apple-ink-muted-48">
          {limitMessage ?? "The media library is not available on your current plan."}
        </p>
        {billingHref && (
          <Button
            onClick={() => window.open(billingHref, "_blank")}
            className="mt-8 rounded-xl"
          >
            Upgrade Plan
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-20 text-center transition-colors ${
        dragOver ? "border-blue-400 bg-blue-50/50" : "border-apple-hairline bg-apple-canvas-parchment"
      }`}
    >
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-apple-primary text-white">
          <CloudUpload className="h-9 w-9" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-apple-canvas ring-1 ring-apple-divider-soft">
          <Upload className="h-4 w-4 text-blue-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-apple-ink">Upload your first file</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-apple-ink-muted-48">
        Drag and drop images, videos, PDFs, and documents here. Everything lives in one unified library.
      </p>
      {onUpload && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          <Upload className="h-4 w-4" />
          Choose files
        </button>
      )}
      <p className="mt-4 text-xs text-apple-ink-muted-48">JPG, PNG, WEBP, SVG, GIF, PDF, DOCX, MP4, ZIP</p>
    </motion.div>
  );
}
