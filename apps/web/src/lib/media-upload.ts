import { mediaApi, type MediaFile } from "@/redux/api/media-api";
import { store } from "@/redux/store";
import { getApiUrl } from "@/lib/urls";
import { getAccessToken, setAccessToken } from "@/lib/access-token";

const apiBaseUrl = getApiUrl();
const MAX_CONCURRENT = 3;

let refreshPromise: Promise<string | null> | null = null;

async function ensureAccessToken(): Promise<string | null> {
  const existing = getAccessToken();
  if (existing) return existing;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return null;
      const json = await response.json();
      const newToken: string | undefined = (json as { data?: { accessToken?: string } })?.data?.accessToken;
      if (newToken) setAccessToken(newToken);
      return newToken ?? null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

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

function appendFileToCache(storeId: string, file: MediaFile) {
  // Optimistically append to the unfiltered first page (Store Media + Builder picker share this)
  store.dispatch(
    mediaApi.util.updateQueryData("getMediaFiles", { storeId, page: 1, limit: 24 }, (draft) => {
      if (draft?.data?.files) {
        const exists = draft.data.files.some((f) => f._id === file._id);
        if (!exists) {
          draft.data.files.unshift(file);
          draft.data.total = (draft.data.total ?? 0) + 1;
        }
      }
    })
  );
  // Invalidate every list/stats query for this store so Builder + Store Media stay in sync
  store.dispatch(
    mediaApi.util.invalidateTags([
      { type: "Media", id: storeId },
      { type: "Media", id: `stats-${storeId}` },
    ])
  );
}

type XhrResult = { status: number; body: unknown };

function createXhrUpload(
  storeId: string,
  item: UploadProgress,
  folder: string | undefined,
  accessToken: string | null,
  signal: AbortSignal,
  onItemUpdate: (item: UploadProgress) => void,
): { xhr: XMLHttpRequest; promise: Promise<XhrResult> } {
  const formData = new FormData();
  formData.append("files", item.file);
  if (folder) formData.append("folder", folder);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${apiBaseUrl}/stores/${storeId}/media/upload`);
  xhr.withCredentials = true;
  if (accessToken) {
    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
  }

  let lastLoaded = 0;
  let lastTime = Date.now();

  const update = (patch: Partial<UploadProgress>) => {
    Object.assign(item, patch);
    onItemUpdate({ ...item });
  };

  signal.addEventListener("abort", () => {
    xhr.abort();
    update({ status: "cancelled", progress: item.progress });
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

  const promise = new Promise<{ status: number; body: unknown }>((resolve, reject) => {
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        resolve({ status: xhr.status, body });
      } catch {
        resolve({ status: xhr.status, body: null });
      }
    };
    xhr.onerror = () => {
      if (item.status !== "cancelled") {
        update({ status: "error", error: "Network error" });
      }
      reject(new Error("Network error"));
    };
  });

  xhr.send(formData);
  return { xhr, promise };
}

function extractUploadedFile(body: unknown): unknown | null {
  const data = (body as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
  if (!data) return null;
  const files = data.files;
  if (Array.isArray(files)) return files[0] ?? null;
  return files ?? null;
}

function extractErrorMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    return String((body as Record<string, unknown>).message);
  }
  return "Upload failed";
}

async function uploadSingleFile(
  storeId: string,
  item: UploadProgress,
  folder: string | undefined,
  signal: AbortSignal,
  onItemUpdate: (item: UploadProgress) => void,
): Promise<unknown> {
  const attempt = async (useToken: string | null): Promise<unknown> => {
    const { promise } = createXhrUpload(storeId, item, folder, useToken, signal, onItemUpdate);
    const { status, body }: XhrResult = await promise;

    if (status >= 200 && status < 300) {
      const uploaded = extractUploadedFile(body);
      updateItem(item, {
        progress: 100,
        status: "done",
        bytesLoaded: item.bytesTotal,
        eta: 0,
        result: uploaded,
      }, onItemUpdate);
      return uploaded;
    }

    // Token expired — refresh and retry once
    if (status === 401 && useToken) {
      updateItem(item, { status: "waiting", progress: 0, error: undefined }, onItemUpdate);
      const newToken = await ensureAccessToken();
      if (newToken && newToken !== useToken) {
        return attempt(newToken);
      }
    }

    const message = extractErrorMessage(body);
    updateItem(item, { status: "error", error: message }, onItemUpdate);
    throw new Error(message);
  };

  return attempt(getAccessToken());
}

function updateItem(
  item: UploadProgress,
  patch: Partial<UploadProgress>,
  onItemUpdate: (item: UploadProgress) => void,
) {
  Object.assign(item, patch);
  onItemUpdate({ ...item });
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
      if (result) {
        uploaded.push(result);
        // Optimistically append to the Redux cache immediately
        appendFileToCache(storeId, result as MediaFile);
      }
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
    // Process items concurrently with a max concurrency of MAX_CONCURRENT
    const inProgress = new Set<Promise<void>>();

    for (const item of items) {
      if (stopped) break;

      // Wait for an active slot
      while (inProgress.size >= MAX_CONCURRENT) {
        await Promise.race(inProgress);
      }

      if (item.status === "waiting" && !stopped) {
        const p = runItem(item).finally(() => inProgress.delete(p));
        inProgress.add(p);
      }
    }

    // Wait for remaining uploads to finish
    if (inProgress.size > 0) {
      await Promise.allSettled(inProgress);
    }
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
