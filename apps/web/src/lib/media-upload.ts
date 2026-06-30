import { mediaApi } from "@/redux/api/media-api";
import { store } from "@/redux/store";
import { getApiUrl } from "@/lib/urls";

const apiBaseUrl = getApiUrl();

export type UploadProgress = {
  fileName: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  result?: unknown;
};

export async function uploadMediaWithProgress(
  storeId: string,
  files: File[],
  options: {
    folder?: string;
    onProgress?: (items: UploadProgress[]) => void;
  }
): Promise<{ files: unknown[]; errors: Array<{ name: string; message: string }> }> {
  const items: UploadProgress[] = files.map((f) => ({
    fileName: f.name,
    file: f,
    progress: 0,
    status: "pending",
  }));
  options.onProgress?.(items);

  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  if (options.folder) formData.append("folder", options.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBaseUrl}/stores/${storeId}/media/upload`);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      items.forEach((item) => {
        if (item.status === "pending" || item.status === "uploading") {
          item.progress = progress;
          item.status = "uploading";
        }
      });
      options.onProgress?.([...items]);
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          items.forEach((item) => {
            item.progress = 100;
            item.status = "done";
          });
          options.onProgress?.([...items]);
          store.dispatch(
            mediaApi.util.invalidateTags([
              { type: "Media", id: storeId },
              { type: "Media", id: `stats-${storeId}` },
            ])
          );
          resolve(body.data ?? { files: [], errors: [] });
        } else {
          const message = body.message ?? "Upload failed";
          items.forEach((item) => {
            item.status = "error";
            item.error = message;
          });
          options.onProgress?.([...items]);
          reject(new Error(message));
        }
      } catch {
        reject(new Error("Invalid upload response"));
      }
    };

    xhr.onerror = () => {
      items.forEach((item) => {
        item.status = "error";
        item.error = "Network error";
      });
      options.onProgress?.([...items]);
      reject(new Error("Network error"));
    };

    xhr.send(formData);
  });
}
