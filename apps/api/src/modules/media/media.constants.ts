export const MEDIA_LIBRARY_FOLDERS = [
  "products",
  "categories",
  "brands",
  "banners",
  "cms",
  "themes",
  "logos",
  "blog",
  "ai-images",
] as const;

/** @deprecated Legacy folders kept for existing uploads */
export const LEGACY_MEDIA_FOLDERS = ["general", "marketing", "documents"] as const;

export const MEDIA_FOLDERS = [...MEDIA_LIBRARY_FOLDERS, ...LEGACY_MEDIA_FOLDERS] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];
export type MediaLibraryFolder = (typeof MEDIA_LIBRARY_FOLDERS)[number];

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
] as const;

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
] as const;

export const FUTURE_MIME_TYPES = ["video/mp4", "audio/mpeg"] as const;

export const ALLOWED_MIME_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES] as const;

export const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/zip": "zip",
  "application/x-zip-compressed": "zip",
};

export function getMediaCategory(mimeType: string): "image" | "document" | "video" | "audio" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (DOCUMENT_MIME_TYPES.includes(mimeType as (typeof DOCUMENT_MIME_TYPES)[number])) return "document";
  return "other";
}

export const DEFAULT_MAX_FILE_SIZE_MB = 10;
