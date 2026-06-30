"use client";

import { useState } from "react";
import { GripVertical, ImagePlus, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { MediaLibrary } from "@/components/media/media-library";
import { uploadMediaWithProgress } from "@/lib/media-upload";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import {
  mediaSelectionFromFile,
  type MediaSelection,
} from "@/lib/media-selection";
import type { MediaFile } from "@/redux/api/media-api";
import { toast } from "sonner";

export function MediaGalleryPicker({
  storeId,
  billingHref,
  value,
  onChange,
  folder = "products",
  label = "Gallery images",
  maxItems = 12,
}: {
  storeId: string;
  billingHref: string;
  value: MediaSelection[];
  onChange: (items: MediaSelection[]) => void;
  folder?: string;
  label?: string;
  maxItems?: number;
}) {
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addSelection = (selection: MediaSelection) => {
    if (value.length >= maxItems) {
      toast.error(`Maximum ${maxItems} images allowed`);
      return;
    }
    if (selection.mediaId && value.some((item) => item.mediaId === selection.mediaId)) {
      toast.message("Image already in gallery");
      return;
    }
    onChange([...value, selection]);
    setOpen(false);
  };

  const handleUpload = async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, maxItems - value.length);
    if (arr.length === 0) return;
    try {
      const result = await uploadMediaWithProgress(storeId, arr, { folder });
      const uploaded = (result.files ?? []) as MediaFile[];
      const next = [
        ...value,
        ...uploaded.map((file) => mediaSelectionFromFile(file)),
      ].slice(0, maxItems);
      onChange(next);
      setOpen(false);
      toast.success(`Added ${uploaded.length} image(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  const moveItem = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= value.length || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div className="flex flex-wrap gap-3">
        {value.map((item, index) => (
          <div
            key={`${item.mediaId ?? item.url}-${index}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) moveItem(dragIndex, index);
              setDragIndex(null);
            }}
            className="group relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveMediaUrl(item.thumbnailUrl || item.url)}
              alt=""
              className="h-20 w-20 rounded-xl border object-cover"
            />
            <span className="absolute left-1 top-1 rounded bg-black/50 p-0.5 text-white opacity-0 group-hover:opacity-100">
              <GripVertical className="h-3.5 w-3.5" />
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < maxItems && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-400 hover:border-zinc-300"
          >
            <ImagePlus className="h-6 w-6" />
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add gallery images" size="xl">
        <div className="mb-4 flex gap-2">
          <label className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50">
            Upload new
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && void handleUpload(e.target.files)}
            />
          </label>
        </div>
        <MediaLibrary
          storeId={storeId}
          billingHref={billingHref}
          folder={folder}
          selectable
          pickerMode
          onSelect={(file) => addSelection(mediaSelectionFromFile(file))}
        />
      </Modal>
    </div>
  );
}
