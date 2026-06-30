import path from "path";
import { getUploadRoot } from "./providers/local-storage.provider.js";

export type SerializedMediaUrls = {
  publicUrl: string;
  thumbnailUrl: string;
  previewUrl: string;
  downloadUrl: string;
};

function getApiBase() {
  return (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");
}

/** Extract `/uploads/...` from any stored URL variant. */
export function extractUploadsPath(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/uploads\/[^\s?#]+/);
  return match ? match[0] : null;
}

export function toRelativeApiUploadPath(url?: string | null): string {
  const uploadsPath = extractUploadsPath(url);
  if (uploadsPath) return `/api${uploadsPath}`;
  if (!url) return "";
  if (url.startsWith("/api/uploads/")) return url;
  if (url.startsWith("/uploads/")) return `/api${url}`;
  return url;
}

export function toAbsoluteApiUploadUrl(url?: string | null): string {
  const relative = toRelativeApiUploadPath(url);
  if (!relative) return "";
  if (relative.startsWith("http")) return relative;
  const webBase = (process.env.WEB_URL ?? process.env.APP_URL ?? getApiBase()).replace(/\/$/, "");
  return `${webBase}${relative}`;
}

export function buildMediaUrls(file: {
  _id: unknown;
  storeId: unknown;
  publicUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileType?: string;
}): SerializedMediaUrls {
  const storeId = String(file.storeId);
  const fileId = String(file._id);
  const publicPath = toRelativeApiUploadPath(file.publicUrl);
  const thumbPath = toRelativeApiUploadPath(file.thumbnailUrl) || publicPath;
  const isImage = file.fileType === "image" || file.mimeType?.startsWith("image/");
  const previewPath = isImage ? thumbPath || publicPath : publicPath;

  return {
    publicUrl: publicPath,
    thumbnailUrl: thumbPath || publicPath,
    previewUrl: previewPath || publicPath,
    downloadUrl: `/api/stores/${storeId}/media/${fileId}/download`,
  };
}

export function serializeMediaFile<T extends Record<string, unknown>>(file: T) {
  const urls = buildMediaUrls(file as unknown as Parameters<typeof buildMediaUrls>[0]);
  return { ...file, ...urls };
}

export function resolveStorageFilePath(storagePath: string) {
  const root = getUploadRoot();
  const resolved = path.resolve(storagePath);
  if (!resolved.startsWith(path.resolve(root))) {
    return null;
  }
  return resolved;
}
