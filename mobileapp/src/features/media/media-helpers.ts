import { config } from "../../config";
import type { MediaFile, MediaFilter } from "./media-types";

export const MEDIA_FOLDERS = ["products", "categories", "brands", "banners", "cms", "themes", "logos", "blog", "ai-images"] as const;

export const MEDIA_FILTERS: Array<{ value: MediaFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Documents" },
  { value: "svg", label: "SVG" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Archives" },
  { value: "other", label: "Other" },
  { value: "used", label: "Used" },
  { value: "unused", label: "Unused" },
];

export function mediaFilterQuery(filter: MediaFilter) {
  if (filter === "unused" || filter === "used") return { usage: filter };
  if (filter === "all") return {};
  if (filter === "svg") return { mimeType: "image/svg+xml" };
  if (filter === "pdf") return { fileType: "pdf" };
  if (filter === "archive") return { fileType: "archive" };
  return { fileType: filter };
}

export function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${Math.round((bytes / 1024 ** index) * 100) / 100} ${sizes[index]}`;
}

export function isImage(file: MediaFile) {
  return file.fileType === "image" || file.mimeType?.startsWith("image/");
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) return "";
  const value = url.trim();
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const path = value.startsWith("/api/uploads/") ? value.replace(/^\/api/, "") : value;
  return `${config.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function mediaPreviewUrl(file: MediaFile) {
  return resolveMediaUrl(file.previewUrl || file.thumbnailUrl || file.publicUrl);
}

export function mediaCopyUrl(file: MediaFile) {
  return resolveMediaUrl(file.publicUrl);
}

export function mediaDownloadUrl(file: MediaFile) {
  return resolveMediaUrl(file.downloadUrl) || `${config.apiUrl}/stores/${file.storeId}/media/${file._id}/download`;
}

export function normalizedFolder(folder?: string | null) {
  const value = folder?.trim() || "products";
  return MEDIA_FOLDERS.includes(value as typeof MEDIA_FOLDERS[number]) || ["general", "marketing", "documents"].includes(value) ? value : "products";
}
