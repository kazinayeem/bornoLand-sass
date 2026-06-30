import type { MediaFile } from "@/redux/api/media-api";
import { absoluteMediaUrl, mediaDownloadUrl, resolveMediaUrl } from "@/lib/resolve-media-url";

export function isPdf(file: MediaFile) {
  return file.mimeType === "application/pdf" || file.extension === "pdf";
}

export function isOfficeDoc(file: MediaFile) {
  return ["docx", "xlsx", "pptx"].includes((file.extension ?? "").toLowerCase());
}

export function isArchive(file: MediaFile) {
  return ["zip", "rar", "7z", "tar", "gz"].includes((file.extension ?? "").toLowerCase());
}

export function isAudio(file: MediaFile) {
  return file.fileType === "audio" || (file.mimeType?.startsWith("audio/") ?? false);
}

export function isVideo(file: MediaFile) {
  return file.fileType === "video" || (file.mimeType?.startsWith("video/") ?? false);
}

export function isImage(file: MediaFile) {
  return file.fileType === "image" || (file.mimeType?.startsWith("image/") ?? false);
}

export function mediaThumbnailSrc(file: MediaFile): string {
  if (isImage(file)) {
    return resolveMediaUrl(file.thumbnailUrl || file.previewUrl || file.publicUrl);
  }
  return "";
}

export function mediaPreviewSrc(file: MediaFile): string {
  if (isImage(file)) {
    return resolveMediaUrl(file.previewUrl || file.publicUrl);
  }
  if (isPdf(file)) {
    return resolveMediaUrl(file.publicUrl);
  }
  return "";
}

export function mediaCopyUrl(file: MediaFile): string {
  return absoluteMediaUrl(file.publicUrl);
}

export function mediaDownloadHref(file: MediaFile): string {
  return file.downloadUrl || mediaDownloadUrl(file.storeId, file._id);
}

export function fileTypeLabel(file: MediaFile): string {
  if (isPdf(file)) return "PDF";
  if (isOfficeDoc(file)) return file.extension.toUpperCase();
  if (isArchive(file)) return "Archive";
  if (isAudio(file)) return "Audio";
  if (isVideo(file)) return "Video";
  if (isImage(file)) return "Image";
  return file.fileType || "File";
}
