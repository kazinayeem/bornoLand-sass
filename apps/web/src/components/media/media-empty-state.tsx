"use client";

import { FolderOpen, Upload } from "lucide-react";

export function MediaEmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg">
        <FolderOpen className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900">Your media library is empty</h3>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Upload product photos, banners, documents, and more. Everything stays organized in one place.
      </p>
      {onUpload && (
        <button
          type="button"
          onClick={onUpload}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          <Upload className="h-4 w-4" />
          Upload your first file
        </button>
      )}
    </div>
  );
}
