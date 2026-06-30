import { mediaSelectionFromUrl, type MediaSelection } from "@/lib/media-selection";

export function mediaIdKeyFor(propKey: string): string {
  return `${propKey}MediaId`;
}

export function readImageSelection(
  props: Record<string, string | undefined>,
  propKey: string,
): MediaSelection | undefined {
  const url = props[propKey] ?? "";
  const mediaId = props[mediaIdKeyFor(propKey)] ?? "";
  if (!url && !mediaId) return undefined;
  return mediaSelectionFromUrl(url, mediaId || undefined);
}

export function patchImageSelection(
  props: Record<string, string | undefined>,
  propKey: string,
  selection: MediaSelection,
): Record<string, string | undefined> {
  const next = { ...props };
  next[propKey] = selection.url;

  const mediaIdKey = mediaIdKeyFor(propKey);
  if (selection.mediaId) {
    next[mediaIdKey] = selection.mediaId;
  } else {
    delete next[mediaIdKey];
  }

  return next;
}

export function clearImageSelection(
  props: Record<string, string | undefined>,
  propKey: string,
): Record<string, string | undefined> {
  const next = { ...props };
  next[propKey] = "";
  delete next[mediaIdKeyFor(propKey)];
  return next;
}
