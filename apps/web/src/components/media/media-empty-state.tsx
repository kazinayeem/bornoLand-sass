"use client";

import { motion } from "framer-motion";
import { CloudUpload, Upload } from "lucide-react";

export function MediaEmptyState({
  onUpload,
  dragOver,
}: {
  onUpload?: () => void;
  dragOver?: boolean;
}) {
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
