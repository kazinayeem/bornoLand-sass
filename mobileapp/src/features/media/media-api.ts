import { config } from "../../config";
import { ApiError, apiRequest, getAccessToken, invalidateApiCache, recoverAccessToken } from "../../lib/api";
import type { ApiEnvelope } from "../../types/domain";
import type { LocalUploadAsset, MediaFile, MediaListData, MediaUsageSummary, StorageStats } from "./media-types";

export type MediaListQuery = {
  search?: string;
  folder?: string;
  fileType?: string;
  usage?: string;
  mimeType?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export const mediaApi = {
  list: (storeId: string, query: MediaListQuery) =>
    apiRequest<ApiEnvelope<MediaListData>>(`/stores/${storeId}/media`, { query }),
  detail: (storeId: string, id: string) =>
    apiRequest<ApiEnvelope<{ file: MediaFile; usage: MediaUsageSummary }>>(`/stores/${storeId}/media/${id}`),
  stats: (storeId: string) =>
    apiRequest<ApiEnvelope<{ stats: StorageStats }>>(`/stores/${storeId}/media/stats`),
  usage: (storeId: string, id: string) =>
    apiRequest<ApiEnvelope<{ file: MediaFile; usage: MediaUsageSummary }>>(`/stores/${storeId}/media/${id}/usage`),
  rename: (storeId: string, id: string, displayName: string) =>
    apiRequest<ApiEnvelope<{ file: MediaFile }>>(`/stores/${storeId}/media/${id}`, { method: "PUT", body: { displayName } }),
  remove: (storeId: string, id: string, force = false) =>
    apiRequest<ApiEnvelope<{ stats: StorageStats }>>(`/stores/${storeId}/media/${id}${force ? "?force=true" : ""}`, { method: "DELETE" }),
  bulkRemove: (storeId: string, fileIds: string[], force = false) =>
    apiRequest<ApiEnvelope<{ deleted: number; failed: number }>>(`/stores/${storeId}/media/bulk-delete`, { method: "POST", body: { fileIds, force } }),
  importUrl: (storeId: string, url: string, folder?: string, displayName?: string) =>
    apiRequest<ApiEnvelope<{ file: MediaFile }>>(`/stores/${storeId}/media/import-url`, { method: "POST", body: { url, folder, displayName } }),
  replace: (storeId: string, id: string, newMediaFileId: string) =>
    apiRequest<ApiEnvelope<{ updated: number; newPublicUrl: string }>>(`/stores/${storeId}/media/${id}/replace`, { method: "POST", body: { newMediaFileId } }),
};

type ProgressUpdate = { loaded: number; total: number; speed: number; eta: number | null; percent: number };

export function uploadMediaAsset(
  storeId: string,
  asset: LocalUploadAsset,
  folder: string,
  onProgress: (progress: ProgressUpdate) => void,
  onXhr?: (xhr: XMLHttpRequest) => void,
  retryAuth = true,
): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("files", { uri: asset.uri, name: asset.name, type: asset.mimeType } as unknown as Blob);
    if (folder) form.append("folder", folder);

    const xhr = new XMLHttpRequest();
    onXhr?.(xhr);
    xhr.open("POST", `${config.apiUrl}/stores/${storeId}/media/upload`);
    xhr.timeout = 120_000;
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("x-app-source", config.appSource);
    const token = getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    let lastLoaded = 0;
    let lastTime = Date.now();
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const now = Date.now();
      const elapsed = Math.max((now - lastTime) / 1000, 0.001);
      const speed = (event.loaded - lastLoaded) / elapsed;
      const remaining = event.total - event.loaded;
      onProgress({ loaded: event.loaded, total: event.total, speed, eta: speed > 0 ? remaining / speed : null, percent: Math.round((event.loaded / event.total) * 100) });
      lastLoaded = event.loaded;
      lastTime = now;
    };

    xhr.onload = async () => {
      let payload: ApiEnvelope<{ files: MediaFile[]; errors?: Array<{ error?: string }> }> = { success: false };
      try { payload = JSON.parse(xhr.responseText) as typeof payload; } catch { /* handled below */ }
      if (xhr.status === 401 && retryAuth && await recoverAccessToken()) {
        uploadMediaAsset(storeId, asset, folder, onProgress, onXhr, false).then(resolve, reject);
        return;
      }
      const file = payload.data?.files?.[0];
      if (xhr.status >= 200 && xhr.status < 300 && payload.success !== false && file) {
        invalidateApiCache();
        resolve(file);
        return;
      }
      reject(new ApiError(payload.message || payload.data?.errors?.[0]?.error || `Upload failed (${xhr.status})`, xhr.status, payload));
    };
    xhr.onerror = () => reject(new ApiError("Cannot reach the Bornoland API during upload.", 0));
    xhr.ontimeout = () => reject(new ApiError("The upload took too long to complete.", 408));
    xhr.onabort = () => reject(new ApiError("Upload cancelled.", 499));
    xhr.send(form);
  });
}
