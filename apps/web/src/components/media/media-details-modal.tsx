"use client";

import { Modal } from "@/components/ui/modal";
import { SafeMediaImage } from "@/components/media/safe-media-image";
import {
  useGetMediaFileQuery,
  formatBytes,
  type MediaFile,
} from "@/redux/api/media-api";
import { entityTypeLabel } from "@/lib/media-usage-labels";
import {
  fileTypeLabel,
  isImage,
  isPdf,
  mediaCopyUrl,
  mediaDownloadHref,
  mediaPreviewSrc,
  mediaThumbnailSrc,
} from "@/lib/media-file-helpers";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

type MediaDetailsModalProps = {
  storeId: string;
  file: MediaFile | null;
  open: boolean;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-2 text-sm last:border-0">
      <span className="shrink-0 text-apple-ink-muted-48">{label}</span>
      <span className="min-w-0 text-right font-medium text-apple-ink">{value}</span>
    </div>
  );
}

export function MediaDetailsModal({ storeId, file, open, onClose }: MediaDetailsModalProps) {
  const { data, isLoading } = useGetMediaFileQuery(
    { storeId, id: file?._id ?? "" },
    { skip: !open || !file?._id }
  );

  const detail = data?.data?.file ?? file;
  const usage = data?.data?.usage;

  if (!file) return null;

  const copyUrl = () => {
    void navigator.clipboard.writeText(mediaCopyUrl(detail ?? file));
    toast.success("URL copied");
  };

  const uploadDate = detail?.createdAt
    ? new Date(detail.createdAt).toLocaleString()
    : "—";

  return (
    <Modal open={open} onClose={onClose} title="Media details" size="lg">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-apple-canvas-parchment">
          {isImage(detail ?? file) ? (
            <SafeMediaImage
              src={mediaThumbnailSrc(detail ?? file)}
              alt={detail?.displayName ?? file.displayName}
              className="aspect-square"
              lazy={false}
            />
          ) : isPdf(detail ?? file) ? (
            <iframe
              src={mediaPreviewSrc(detail ?? file)}
              title="PDF preview"
              className="aspect-[4/3] w-full"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-2xl font-bold uppercase text-apple-ink-muted-48">
              {(detail ?? file).extension}
            </div>
          )}
        </div>

        <div className="space-y-1">
          {isLoading && <p className="text-xs text-apple-ink-muted-48">Loading details…</p>}
          <DetailRow label="Name" value={detail?.displayName || detail?.originalName || file.originalName} />
          <DetailRow label="Extension" value={(detail ?? file).extension.toUpperCase() || "—"} />
          <DetailRow label="File type" value={fileTypeLabel(detail ?? file)} />
          <DetailRow
            label="Dimensions"
            value={
              detail?.width && detail?.height ? `${detail.width} × ${detail.height}` : "—"
            }
          />
          <DetailRow label="File size" value={formatBytes((detail ?? file).size)} />
          <DetailRow label="Upload date" value={uploadDate} />
          <DetailRow label="Usage count" value={usage?.total ?? detail?.referenceCount ?? 0} />
          <DetailRow label="Folder" value={(detail ?? file).folder || "—"} />
          {(detail ?? file).storagePath && (
            <DetailRow label="Storage path" value={<span className="break-all text-xs">{(detail ?? file).storagePath}</span>} />
          )}

          {usage && Object.keys(usage.byEntityType).length > 0 && (
            <div className="mt-4 rounded-xl border border-zinc-100 bg-apple-canvas-parchment p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-apple-ink-muted-48">Used by</p>
              <div className="space-y-1">
                {Object.entries(usage.byEntityType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-apple-ink-muted-80">{entityTypeLabel(type)}</span>
                    <span className="font-medium text-apple-ink">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={copyUrl}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 py-2 text-sm font-medium"
            >
              <Copy className="h-4 w-4" />
              Copy URL
            </button>
            <a
              href={mediaDownloadHref(detail ?? file)}
              download
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2 text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
