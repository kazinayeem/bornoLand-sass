"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Pencil,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { MediaFile } from "@/redux/api/media-api";
import { formatBytes } from "@/redux/api/media-api";
import {
  fileTypeLabel,
  isAudio,
  isImage,
  isPdf,
  isVideo,
  mediaCopyUrl,
  mediaDownloadHref,
  mediaPreviewSrc,
} from "@/lib/media-file-helpers";
import { toast } from "sonner";

type MediaPreviewViewerProps = {
  file: MediaFile | null;
  files?: MediaFile[];
  open: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
  index?: number;
  onDelete?: (file: MediaFile) => void;
  onRename?: (file: MediaFile) => void;
};

export function MediaPreviewViewer({
  file,
  files = [],
  open,
  onClose,
  onNavigate,
  index = 0,
  onDelete,
  onRename,
}: MediaPreviewViewerProps) {
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetView = useCallback(() => {
    setScale(1);
    setCopied(false);
  }, []);

  useEffect(() => {
    if (open) resetView();
  }, [open, file?._id, resetView]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onNavigate && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && onNavigate && index < files.length - 1) onNavigate(index + 1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, index, files.length, onClose, onNavigate]);

  if (!file || !open) return null;

  const title = file.displayName || file.originalName;
  const src = mediaPreviewSrc(file);
  const publicUrl = mediaCopyUrl(file);

  const copyUrl = () => {
    void navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("URL copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const canNavigate = files.length > 1 && onNavigate;

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-[70] flex flex-col ${fullscreen ? "bg-black" : "bg-black/90 backdrop-blur-sm"}`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="text-xs text-white/60">
              {fileTypeLabel(file)} · {formatBytes(file.size)}
              {file.width && file.height ? ` · ${file.width}×${file.height}` : ""}
              {canNavigate ? ` · ${index + 1} of ${files.length}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {isImage(file) && (
              <>
                <ToolbarBtn onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} icon={ZoomOut} />
                <ToolbarBtn onClick={() => setScale((s) => Math.min(4, s + 0.25))} icon={ZoomIn} />
              </>
            )}
            <ToolbarBtn
              onClick={() => setFullscreen((v) => !v)}
              icon={fullscreen ? Minimize2 : Maximize2}
            />
            <ToolbarBtn onClick={copyUrl} icon={copied ? Check : Copy} active={copied} />
            <a
              href={mediaDownloadHref(file)}
              download
              className="rounded-lg p-2 text-white/90 transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
            </a>
            {onRename && <ToolbarBtn onClick={() => onRename(file)} icon={Pencil} />}
            {onDelete && <ToolbarBtn onClick={() => onDelete(file)} icon={Trash2} danger />}
            <ToolbarBtn onClick={onClose} icon={X} />
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
          {canNavigate && index > 0 && (
            <button
              type="button"
              onClick={() => onNavigate(index - 1)}
              className="absolute left-4 z-10 rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canNavigate && index < files.length - 1 && (
            <button
              type="button"
              onClick={() => onNavigate(index + 1)}
              className="absolute right-4 z-10 rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {isImage(file) && src ? (
            <motion.div style={{ scale }} className="max-h-full max-w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={title} className="max-h-[78vh] max-w-[92vw] object-contain" />
            </motion.div>
          ) : isPdf(file) && src ? (
            <iframe src={src} title={title} className="h-[78vh] w-full max-w-4xl rounded-xl bg-white" />
          ) : isVideo(file) && publicUrl ? (
            <video src={publicUrl} controls className="max-h-[78vh] max-w-full rounded-xl bg-black" />
          ) : isAudio(file) && publicUrl ? (
            <div className="w-full max-w-lg rounded-2xl bg-white/10 p-8 backdrop-blur">
              <audio src={publicUrl} controls className="w-full" />
            </div>
          ) : (
            <div className="max-w-md rounded-2xl bg-white/10 p-8 text-center text-white backdrop-blur">
              <p className="text-lg font-semibold">{title}</p>
              <p className="mt-2 text-sm text-white/70">Preview not available for this file type</p>
              <p className="mt-4 text-xs text-white/50">
                {file.mimeType} · {file.extension.toUpperCase()}
              </p>
              <a
                href={mediaDownloadHref(file)}
                download
                className="mt-6 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}

function ToolbarBtn({
  onClick,
  icon: Icon,
  danger,
  active,
}: {
  onClick?: () => void;
  icon: typeof X;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg p-2 text-white/90 transition hover:bg-white/10 ${danger ? "text-red-400" : ""} ${active ? "bg-emerald-500/20" : ""}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
