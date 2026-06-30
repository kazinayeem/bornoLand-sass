import { mediaApi } from "@/redux/api/media-api";
import { store } from "@/redux/store";
import { getApiUrl } from "@/lib/urls";

const apiBaseUrl = getApiUrl();

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type UploadStatus = "waiting" | "uploading" | "done" | "error" | "cancelled";

export type UploadProgress = {
  id: string;
  fileName: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
  result?: unknown;
  bytesLoaded: number;
  bytesTotal: number;
  speed: number;
  eta: number | null;
};

export type UploadQueueHandle = {
  pause: () => void;
  resume: () => void;
  cancel: (id: string) => void;
  cancelAll: () => void;
  retry: (id: string) => void;
};

function createProgressItem(file: File): UploadProgress {
  return {
    id: uid(),
    fileName: file.name,
    file,
    progress: 0,
    status: "waiting",
    bytesLoaded: 0,
    bytesTotal: file.size,
    speed: 0,
    eta: null,
  };
}

function invalidateMediaTags(storeId: string) {
  store.dispatch(
    mediaApi.util.invalidateTags([
      { type: "Media", id: storeId },
      { type: "Media", id: `stats-${storeId}` },
    ]),
  );
}

function uploadSingleFile(
  storeId: string,
  item: UploadProgress,
  folder: string | undefined,
  signal: AbortSignal,
  onItemUpdate: (item: UploadProgress) => void,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("files", item.file);
    if (folder) formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${apiBaseUrl}/stores/${storeId}/media/upload`);
    xhr.withCredentials = true;

    let lastLoaded = 0;
    let lastTime = Date.now();

    const update = (patch: Partial<UploadProgress>) => {
      Object.assign(item, patch);
      onItemUpdate({ ...item });
    };

    signal.addEventListener("abort", () => {
      xhr.abort();
      update({ status: "cancelled", progress: item.progress });
      reject(new DOMException("Upload cancelled", "AbortError"));
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      const delta = event.loaded - lastLoaded;
      const speed = elapsed > 0 ? delta / elapsed : item.speed;
      const remaining = event.total - event.loaded;
      const eta = speed > 0 ? remaining / speed : null;
      lastLoaded = event.loaded;
      lastTime = now;

      update({
        status: "uploading",
        progress: Math.round((event.loaded / event.total) * 100),
        bytesLoaded: event.loaded,
        bytesTotal: event.total,
        speed,
        eta,
      });
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          const uploaded = body.data?.files?.[0] ?? body.data?.files ?? null;
          update({
            progress: 100,
            status: "done",
            bytesLoaded: item.bytesTotal,
            eta: 0,
            result: uploaded,
          });
          resolve(uploaded);
        } else {
          const message = body.message ?? "Upload failed";
          update({ status: "error", error: message });
          reject(new Error(message));
        }
      } catch {
        update({ status: "error", error: "Invalid upload response" });
        reject(new Error("Invalid upload response"));
      }
    };

    xhr.onerror = () => {
      if (item.status !== "cancelled") {
        update({ status: "error", error: "Network error" });
      }
      reject(new Error("Network error"));
    };

    xhr.send(formData);
  });
}

export function uploadMediaQueue(
  storeId: string,
  files: File[],
  options: {
    folder?: string;
    onProgress?: (items: UploadProgress[]) => void;
  },
): { promise: Promise<{ files: unknown[]; errors: Array<{ name: string; message: string }> }>; handle: UploadQueueHandle } {
  const items: UploadProgress[] = files.map(createProgressItem);
  let paused = false;
  let stopped = false;
  const abortControllers = new Map<string, AbortController>();
  const uploaded: unknown[] = [];
  const errors: Array<{ name: string; message: string }> = [];

  const emit = () => options.onProgress?.(items.map((item) => ({ ...item })));

  const waitWhilePaused = () =>
    new Promise<void>((resolve) => {
      const tick = () => {
        if (!paused || stopped) resolve();
        else setTimeout(tick, 80);
      };
      tick();
    });

  const runItem = async (item: UploadProgress) => {
    const isCancelled = () => item.status === "cancelled";
    if (item.status === "done" || isCancelled()) return;
    await waitWhilePaused();
    if (stopped || isCancelled()) return;

    const controller = new AbortController();
    abortControllers.set(item.id, controller);
    item.status = "uploading";
    emit();

    try {
      const result = await uploadSingleFile(storeId, item, options.folder, controller.signal, () => emit());
      if (result) uploaded.push(result);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (!isCancelled()) {
        errors.push({ name: item.fileName, message: item.error ?? "Upload failed" });
      }
    } finally {
      abortControllers.delete(item.id);
    }
  };

  const processQueue = async () => {
    for (const item of items) {
      if (stopped) break;
      if (item.status === "waiting") await runItem(item);
    }
    if (uploaded.length > 0) invalidateMediaTags(storeId);
    return { files: uploaded, errors };
  };

  const handle: UploadQueueHandle = {
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    cancel: (id: string) => {
      const controller = abortControllers.get(id);
      const item = items.find((i) => i.id === id);
      if (item && item.status === "waiting") {
        item.status = "cancelled";
        emit();
        return;
      }
      controller?.abort();
    },
    cancelAll: () => {
      stopped = true;
      paused = false;
      for (const controller of abortControllers.values()) controller.abort();
      for (const item of items) {
        if (item.status === "waiting" || item.status === "uploading") {
          item.status = "cancelled";
        }
      }
      emit();
    },
    retry: (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      item.status = "waiting";
      item.progress = 0;
      item.error = undefined;
      item.bytesLoaded = 0;
      item.speed = 0;
      item.eta = null;
      stopped = false;
      emit();
      void runItem(item);
    },
  };

  emit();
  return { promise: processQueue(), handle };
}

/** @deprecated Use uploadMediaQueue for queue controls. Kept for picker compatibility. */
export async function uploadMediaWithProgress(
  storeId: string,
  files: File[],
  options: {
    folder?: string;
    onProgress?: (items: UploadProgress[]) => void;
  },
): Promise<{ files: unknown[]; errors: Array<{ name: string; message: string }> }> {
  const { promise } = uploadMediaQueue(storeId, files, options);
  return promise;
}
