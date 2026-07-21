"use client";

import { Modal } from "@/components/ui/modal";
import type { MediaFile } from "@/redux/api/media-api";
import {
  fileTypeLabel,
  isOfficeDoc,
  isPdf,
  mediaDownloadHref,
  mediaPreviewSrc,
} from "@/lib/media-file-helpers";
import { formatBytes } from "@/redux/api/media-api";
import {
  FileArchive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react";

type MediaPreviewModalProps = {
  file: MediaFile | null;
  open: boolean;
  onClose: () => void;
};

function OfficeIcon({ extension }: { extension: string }) {
  const ext = extension.toLowerCase();
  if (ext === "xlsx") return <FileSpreadsheet className="h-16 w-16 text-emerald-600" />;
  if (ext === "pptx") return <Presentation className="h-16 w-16 text-orange-600" />;
  return <FileText className="h-16 w-16 text-blue-600" />;
}

function FileIconPreview({ file }: { file: MediaFile }) {
  if (file.fileType === "video") return <FileVideo className="h-16 w-16 text-violet-600" />;
  if (file.mimeType?.startsWith("audio/")) return <FileAudio className="h-16 w-16 text-pink-600" />;
  if (["zip", "rar", "7z"].includes(file.extension)) return <FileArchive className="h-16 w-16 text-amber-600" />;
  if (isOfficeDoc(file)) return <OfficeIcon extension={file.extension} />;
  return <FileText className="h-16 w-16 text-apple-ink-muted-48" />;
}

export function MediaPreviewModal({ file, open, onClose }: MediaPreviewModalProps) {
  if (!file) return null;

  const pdfSrc = isPdf(file) ? mediaPreviewSrc(file) : "";
  const title = file.displayName || file.originalName;

  return (
    <Modal open={open} onClose={onClose} title={title} size="full" className="max-h-[90vh] overflow-hidden">
      {isPdf(file) && pdfSrc ? (
        <iframe
          src={pdfSrc}
          title={title}
          className="h-[70vh] w-full rounded-xl border border-zinc-200 bg-apple-canvas-parchment"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <FileIconPreview file={file} />
          <div className="text-center">
            <p className="font-medium text-apple-ink">{title}</p>
            <p className="mt-1 text-sm text-apple-ink-muted-48">
              {fileTypeLabel(file)} · {formatBytes(file.size)}
            </p>
            <p className="mt-1 text-xs text-apple-ink-muted-48">Preview not available for this file type</p>
          </div>
          <a
            href={mediaDownloadHref(file)}
            download
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Download file
          </a>
        </div>
      )}
    </Modal>
  );
}
