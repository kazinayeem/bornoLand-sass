"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Eye,
  FileArchive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  MoreHorizontal,
  Pencil,
  Presentation,
  Trash2,
} from "lucide-react";
import { formatBytes, type MediaFile } from "@/redux/api/media-api";
import { SafeMediaImage } from "@/components/media/safe-media-image";
import {
  fileTypeLabel,
  isImage,
  isOfficeDoc,
  isPdf,
  mediaDownloadHref,
  mediaThumbnailSrc,
} from "@/lib/media-file-helpers";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

function FileTypeIcon({ file }: { file: MediaFile }) {
  const ext = (file.extension ?? "").toLowerCase();
  if (file.fileType === "video") return <FileVideo className="h-10 w-10 text-violet-500" />;
  if (file.mimeType?.startsWith("audio/")) return <FileAudio className="h-10 w-10 text-pink-500" />;
  if (["zip", "rar", "7z"].includes(ext)) return <FileArchive className="h-10 w-10 text-amber-500" />;
  if (ext === "xlsx") return <FileSpreadsheet className="h-10 w-10 text-emerald-600" />;
  if (ext === "pptx") return <Presentation className="h-10 w-10 text-orange-600" />;
  if (isOfficeDoc(file) || isPdf(file)) return <FileText className="h-10 w-10 text-blue-600" />;
  return <FileText className="h-10 w-10 text-apple-ink-muted-48" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type MediaLibraryCardProps = {
  file: MediaFile;
  selected?: boolean;
  onToggleSelect?: () => void;
  onPreview: () => void;
  onCopy: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSelect?: () => void;
  copied?: boolean;
};

export const MediaLibraryCard = memo(function MediaLibraryCard({
  file,
  selected,
  onToggleSelect,
  onPreview,
  onCopy,
  onRename,
  onDelete,
  onSelect,
  copied,
}: MediaLibraryCardProps) {
  const [hovered, setHovered] = useState(false);
  const thumb = mediaThumbnailSrc(file);
  const name = file.displayName || file.originalName;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative overflow-hidden rounded-lg border bg-apple-canvas transition-colors ${
        selected ? "border-blue-500 ring-2 ring-blue-100" : "border-apple-divider-soft"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-apple-canvas-parchment">
        {isImage(file) && thumb ? (
          <button type="button" onClick={onPreview} className="block h-full w-full">
            <SafeMediaImage src={thumb} alt={name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onPreview}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <FileTypeIcon file={file} />
          </button>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-apple-ink-muted-80 shadow-sm backdrop-blur-sm">
          {fileTypeLabel(file)}
        </span>

        {onToggleSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="absolute right-2 top-2 z-10 h-4 w-4 rounded border-zinc-300"
          />
        )}

        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-2"
          >
            <ActionIcon icon={Eye} label="Preview" onClick={onPreview} />
            <ActionIcon icon={Copy} label={copied ? "Copied ✓" : "Copy URL"} onClick={onCopy} active={copied} />
            <a
              href={mediaDownloadHref(file)}
              download
              title="Download"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
            <ActionIcon icon={Pencil} label="Rename" onClick={onRename} />
            <ActionIcon icon={Trash2} label="Delete" onClick={onDelete} danger />
            {/* Portal-based DropdownMenu — never clipped by overflow:hidden parent */}
            <DropdownMenu
              placement="top-end"
              minWidth={144}
              trigger={
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white"
                  title="More"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              }
              items={[
                ...(onSelect ? [{ label: "Select file", onClick: onSelect }] : []),
                { label: "Rename", icon: Pencil, onClick: onRename },
                { divider: true as const },
                { label: "Delete", icon: Trash2, onClick: onDelete, danger: true },
              ]}
            />
          </motion.div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <p className="truncate text-sm font-medium text-apple-ink" title={name}>
          {name}
        </p>
        <p className="text-xs text-apple-ink-muted-48">
          {formatBytes(file.size)}
          {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
        </p>
        <p className="text-[11px] text-apple-ink-muted-48">{formatDate(file.createdAt)}</p>
        {onSelect && (
          <button
            type="button"
            onClick={onSelect}
            className="mt-2 w-full rounded-lg bg-zinc-900 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Select
          </button>
        )}
      </div>
    </motion.div>
  );
});

function ActionIcon({
  icon: Icon,
  label,
  onClick,
  danger,
  active,
}: {
  icon: typeof Eye;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-zinc-800 shadow-sm backdrop-blur transition hover:bg-white ${
        danger ? "hover:!bg-red-500 hover:!text-white" : ""
      } ${active ? "!bg-emerald-500 !text-white" : ""}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
