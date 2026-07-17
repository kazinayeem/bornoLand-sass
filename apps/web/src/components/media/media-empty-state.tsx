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
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 px-6 py-20 text-center bg-gradient-to-b from-zinc-50/80 to-white"
      >
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-400 to-zinc-500 text-white shadow-lg shadow-zinc-600/25">
            <Ban className="h-9 w-9" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-zinc-100">
            <HardDrive className="h-4 w-4 text-zinc-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Media storage not included</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
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
        <p className="mt-4 text-xs text-zinc-400">JPG, PNG, WEBP, SVG, GIF, PDF, DOCX, MP4, ZIP</p>
      </motion.div>
    );
  }

  if (limitType === "storage-full") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-amber-200 px-6 py-20 text-center bg-gradient-to-b from-amber-50/50 to-white"
      >
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-600/25">
            <HardDrive className="h-9 w-9" />
          </div>
          <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-amber-100">
            <Ban className="h-4 w-4 text-amber-500" />
          </div>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Storage limit reached</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
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
        <p className="mt-4 text-xs text-zinc-400">Delete files or upgrade to continue uploading.</p>
      </motion.div>
    );
  }

  if (limitType === "feature-disabled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 px-6 py-20 text-center bg-gradient-to-b from-zinc-50/80 to-white"
      >
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-400 to-zinc-500 text-white shadow-lg shadow-zinc-600/25">
            <Ban className="h-9 w-9" />
          </div>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Media feature unavailable</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
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
      className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-20 text-center transition-colors ${
        dragOver ? "border-blue-400 bg-blue-50/50" : "border-zinc-200 bg-gradient-to-b from-zinc-50/80 to-white"
      }`}
    >
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25">
          <CloudUpload className="h-9 w-9" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-zinc-100">
          <Upload className="h-4 w-4 text-blue-600" />
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-900">Upload your first file</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        Drag and drop images, videos, PDFs, and documents here. Everything lives in one unified library.
      </p>
      {onUpload && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          <Upload className="h-4 w-4" />
          Choose files
        </button>
      )}
      <p className="mt-4 text-xs text-zinc-400">JPG, PNG, WEBP, SVG, GIF, PDF, DOCX, MP4, ZIP</p>
    </motion.div>
  );
}
