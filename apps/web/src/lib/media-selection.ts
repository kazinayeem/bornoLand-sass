import type { MediaFile } from "@/redux/api/media-api";

export type MediaSelection = {
  mediaId?: string;
  url: string;
  thumbnailUrl?: string;
  file?: MediaFile;
};

export function mediaSelectionFromFile(file: MediaFile): MediaSelection {
  return {
    mediaId: file._id,
    url: file.publicUrl,
    thumbnailUrl: file.thumbnailUrl || file.publicUrl,
    file,
  };
}

export function mediaSelectionFromUrl(url: string, mediaId?: string): MediaSelection {
  return { mediaId, url };
}

export function normalizeMediaSelection(value?: string | MediaSelection | null): MediaSelection | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    return value ? { url: value } : undefined;
  }
  return value.url ? value : undefined;
}

export function selectionUrl(value?: string | MediaSelection | null) {
  return normalizeMediaSelection(value)?.url ?? "";
}

export function selectionMediaId(value?: string | MediaSelection | null) {
  return normalizeMediaSelection(value)?.mediaId;
}
