"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  RefreshCw,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { MediaFile } from "@/redux/api/media-api";
import { mediaCopyUrl, mediaDownloadHref, mediaPreviewSrc } from "@/lib/media-file-helpers";
import { toast } from "sonner";

type MediaLightboxProps = {
  files: MediaFile[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete?: (file: MediaFile) => void;
  onReplace?: (file: MediaFile) => void;
};

export function MediaLightbox({
  files,
  index,
  open,
  onClose,
  onNavigate,
  onDelete,
  onReplace,
}: MediaLightboxProps) {
  const file = files[index];
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (open) resetView();
  }, [open, index, resetView]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
      if (e.key === "ArrowRight" && index < files.length - 1) onNavigate(index + 1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, index, files.length, onClose, onNavigate]);

  if (!file) return null;

  const src = mediaPreviewSrc(file);

  const copyUrl = () => {
    void navigator.clipboard.writeText(mediaCopyUrl(file));
    toast.success("URL copied");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95">
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.displayName || file.originalName}</p>
              <p className="text-xs text-white/60">
                {index + 1} of {files.length}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} className="rounded-lg p-2 hover:bg-white/10">
                <ZoomOut className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setScale((s) => Math.min(4, s + 0.25))} className="rounded-lg p-2 hover:bg-white/10">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button type="button" onClick={copyUrl} className="rounded-lg p-2 hover:bg-white/10">
                <Copy className="h-4 w-4" />
              </button>
              <a href={mediaDownloadHref(file)} download className="rounded-lg p-2 hover:bg-white/10">
                <Download className="h-4 w-4" />
              </a>
              {onReplace && (
                <button type="button" onClick={() => onReplace(file)} className="rounded-lg p-2 hover:bg-white/10">
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={() => onDelete(file)} className="rounded-lg p-2 text-red-400 hover:bg-white/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onWheel={(e) => {
              e.preventDefault();
              setScale((s) => Math.min(4, Math.max(0.5, s + (e.deltaY < 0 ? 0.1 : -0.1))));
            }}
          >
            {index > 0 && (
              <button
                type="button"
                onClick={() => onNavigate(index - 1)}
                className="absolute left-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {index < files.length - 1 && (
              <button
                type="button"
                onClick={() => onNavigate(index + 1)}
                className="absolute right-3 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <motion.div
              className="cursor-grab active:cursor-grabbing"
              style={{ scale, x: offset.x, y: offset.y }}
              onMouseDown={(e) => {
                setDragging(true);
                setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
              }}
              onMouseMove={(e) => {
                if (!dragging) return;
                setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }}
              onMouseUp={() => setDragging(false)}
              onMouseLeave={() => setDragging(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={file.displayName} className="max-h-[75vh] max-w-[90vw] select-none object-contain" draggable={false} />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
