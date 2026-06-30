"use client";

import { memo } from "react";
import { AnimatePresence } from "framer-motion";
import type { MediaFile } from "@/redux/api/media-api";
import { MediaLibraryCard } from "@/components/media/media-library-card";

type MediaLibraryGridProps = {
  files: MediaFile[];
  selectedIds: Set<string>;
  copiedId: string | null;
  selectable?: boolean;
  onToggleSelect: (id: string) => void;
  onPreview: (file: MediaFile) => void;
  onCopy: (file: MediaFile) => void;
  onRename: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  onSelect?: (file: MediaFile) => void;
};

export const MediaLibraryGrid = memo(function MediaLibraryGrid({
  files,
  selectedIds,
  copiedId,
  selectable,
  onToggleSelect,
  onPreview,
  onCopy,
  onRename,
  onDelete,
  onSelect,
}: MediaLibraryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <MediaLibraryCard
            key={file._id}
            file={file}
            selected={selectedIds.has(file._id)}
            onToggleSelect={selectable ? () => onToggleSelect(file._id) : undefined}
            onPreview={() => onPreview(file)}
            onCopy={() => onCopy(file)}
            onRename={() => onRename(file)}
            onDelete={() => onDelete(file)}
            onSelect={onSelect ? () => onSelect(file) : undefined}
            copied={copiedId === file._id}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});
