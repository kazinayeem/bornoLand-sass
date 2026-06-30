"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { Clock, ImagePlus, Library, RefreshCw, Upload } from "lucide-react";
import { formatBytes } from "@/lib/format-bytes";
import { Modal } from "@/components/ui/modal";
import type { MediaFile } from "@/redux/api/media-api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import {
  mediaSelectionFromFile,
  selectionUrl,
  type MediaSelection,
} from "@/lib/media-selection";
import { uploadMediaWithProgress, type UploadProgress } from "@/lib/media-upload";
import { toast } from "sonner";
import { SmartImage } from "@/components/ui/smart-image";

const MediaLibrary = dynamic(
  () => import("@/components/media/media-library").then((module) => module.MediaLibrary),
  {
    loading: () => <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-sm text-zinc-500">Loading media library...</div>,
  }
);

type PickerTab = "library" | "upload" | "recent";

function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url, "https://placeholder.local").pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : "Selected image";
  } catch {
    const segment = url.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : "Selected image";
  }
}

function selectionMeta(value?: string | MediaSelection | null) {
  const selection = typeof value === "string" ? (value ? { url: value } : undefined) : value?.url ? value : undefined;
  if (!selection) return null;

  const name = selection.file?.displayName || selection.file?.originalName || fileNameFromUrl(selection.url);
  const size = selection.file?.size ? formatBytes(selection.file.size) : "";
  const dimensions =
    selection.file?.width && selection.file?.height
      ? `${selection.file.width} × ${selection.file.height}`
      : "";

  return { name, size, dimensions };
}

export function MediaPicker({
  storeId,
  billingHref,
  value,
  onChange,
  folder = "products",
  label = "Image",
  compact = false,
  hideLabel = false,
}: {
  storeId: string;
  billingHref: string;
  value?: string | MediaSelection | null;
  onChange: (selection: MediaSelection) => void;
  folder?: string;
  label?: string;
  compact?: boolean;
  hideLabel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PickerTab>("library");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = selectionUrl(value);
  const meta = selectionMeta(value);
  const previewSize = compact ? "h-16 w-16" : "h-20 w-20";
  const openPicker = () => setOpen(true);

  const handleSelect = useCallback(
    (file: MediaFile) => {
      onChange(mediaSelectionFromFile(file));
      setOpen(false);
    },
    [onChange]
  );

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const arr = Array.from(fileList);
      if (arr.length === 0) return;
      try {
        const result = await uploadMediaWithProgress(storeId, arr, {
          folder,
          onProgress: setUploads,
        });
        const uploaded = (result.files ?? []) as MediaFile[];
        if (uploaded[0]) {
          onChange(mediaSelectionFromFile(uploaded[0]));
          setOpen(false);
          toast.success("Image uploaded");
        }
        setTimeout(() => setUploads([]), 1500);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    },
    [storeId, folder, onChange]
  );

  const tabs: Array<{ id: PickerTab; label: string; icon: typeof Library }> = [
    { id: "library", label: "Media Library", icon: Library },
    { id: "upload", label: "Upload New", icon: Upload },
    { id: "recent", label: "Recent", icon: Clock },
  ];

  return (
    <div className="space-y-2">
      {!hideLabel && <label className="text-sm font-medium text-zinc-700">{label}</label>}
      <div className={`flex flex-wrap items-start gap-3 ${compact ? "" : ""}`}>
        {previewUrl ? (
          <div className={`relative ${previewSize} shrink-0 overflow-hidden rounded-xl border`}>
            <SmartImage
              src={resolveMediaUrl(previewUrl)}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className={`flex ${previewSize} shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400`}>
            <ImagePlus className={compact ? "h-5 w-5" : "h-6 w-6"} />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          {meta && (
            <div className="space-y-0.5">
              <p className="truncate text-[11px] font-medium text-zinc-800">{meta.name}</p>
              {(meta.size || meta.dimensions) && (
                <p className="text-[10px] text-zinc-500">
                  {[meta.size, meta.dimensions].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openPicker}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 font-medium hover:bg-zinc-50 ${
                compact ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2 text-sm"
              }`}
            >
              <Library className={compact ? "h-3 w-3" : "h-4 w-4"} />
              {previewUrl ? "Open Media Library" : "Choose Image"}
            </button>
            {previewUrl && (
              <>
                <button
                  type="button"
                  onClick={openPicker}
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 font-medium hover:bg-zinc-50 ${
                    compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-sm"
                  }`}
                >
                  <RefreshCw className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ url: "" })}
                  className={compact ? "text-[11px] text-red-600" : "text-sm text-red-600"}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Media Picker" size="xl">
        <div className="mb-4 flex flex-wrap gap-2 border-b border-zinc-100 pb-3">
          {tabs.map(({ id, label: tabLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                tab === id ? "bg-zinc-900 text-white" : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tabLabel}
            </button>
          ))}
        </div>

        {tab === "library" && (
          <MediaLibrary
            storeId={storeId}
            billingHref={billingHref}
            folder={folder}
            selectable
            pickerMode
            onSelect={handleSelect}
          />
        )}

        {tab === "recent" && (
          <MediaLibrary
            storeId={storeId}
            billingHref={billingHref}
            sort="recent"
            selectable
            pickerMode
            onSelect={handleSelect}
          />
        )}

        {tab === "upload" && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.length) void handleUpload(e.dataTransfer.files);
              }}
              onPaste={(e) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                const files: File[] = [];
                for (const item of items) {
                  if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                  }
                }
                if (files.length) void handleUpload(files);
              }}
              tabIndex={0}
              className={`rounded-2xl border-2 border-dashed p-10 text-center outline-none transition-colors ${
                dragOver ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
              }`}
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
              <p className="text-sm font-medium text-zinc-900">Drag & drop, paste, or browse</p>
              <p className="mt-1 text-xs text-zinc-500">Images are optimized automatically on upload</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Browse files
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files && void handleUpload(e.target.files)}
              />
            </div>

            {uploads.length > 0 && (
              <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                {uploads.map((upload) => (
                  <div key={upload.fileName} className="text-xs text-zinc-600">
                    {upload.fileName}: {upload.progress}%
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
