import { useCallback, useRef, useState } from "react";
import { ApiError } from "../../lib/api";
import { uploadMediaAsset } from "./media-api";
import type { LocalUploadAsset, UploadItem } from "./media-types";

let nextUploadId = 1;

export function useMediaUploadQueue(storeId: string | undefined, folder: string, onUploaded: () => void) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const items = useRef<UploadItem[]>([]);
  const active = useRef(new Map<string, XMLHttpRequest>());
  const paused = useRef(false);

  const sync = useCallback(() => setUploads(items.current.map((item) => ({ ...item }))), []);

  const pump = useCallback(() => {
    if (!storeId || paused.current) return;
    while (active.current.size < 3) {
      const item = items.current.find((candidate) => candidate.status === "waiting");
      if (!item) break;
      item.status = "uploading";
      sync();
      void uploadMediaAsset(storeId, item, folder, (progress) => {
        Object.assign(item, { progress: progress.percent, bytesLoaded: progress.loaded, bytesTotal: progress.total, speed: progress.speed, eta: progress.eta });
        sync();
      }, (xhr) => active.current.set(item.id, xhr)).then((file) => {
        active.current.delete(item.id);
        Object.assign(item, { progress: 100, status: "done", result: file, bytesLoaded: item.bytesTotal, eta: 0 });
        sync();
        onUploaded();
        pump();
      }).catch((error: unknown) => {
        active.current.delete(item.id);
        if (item.status !== "cancelled") {
          item.status = error instanceof ApiError && error.status === 499 ? "cancelled" : "error";
          item.error = error instanceof Error ? error.message : "Upload failed";
        }
        sync();
        pump();
      });
    }
  }, [folder, onUploaded, storeId, sync]);

  const enqueue = useCallback((assets: LocalUploadAsset[]) => {
    const additions = assets.map<UploadItem>((asset) => ({
      ...asset,
      id: `upload-${Date.now()}-${nextUploadId++}`,
      progress: 0,
      status: "waiting",
      bytesLoaded: 0,
      bytesTotal: asset.size ?? 0,
      speed: 0,
      eta: null,
    }));
    items.current = [...items.current, ...additions];
    sync();
    setTimeout(pump, 0);
  }, [pump, sync]);

  const pause = useCallback(() => { paused.current = true; sync(); }, [sync]);
  const resume = useCallback(() => { paused.current = false; sync(); pump(); }, [pump, sync]);
  const cancel = useCallback((id: string) => {
    const item = items.current.find((candidate) => candidate.id === id);
    if (!item) return;
    item.status = "cancelled";
    active.current.get(id)?.abort();
    active.current.delete(id);
    sync();
    pump();
  }, [pump, sync]);
  const retry = useCallback((id: string) => {
    const item = items.current.find((candidate) => candidate.id === id);
    if (!item || !["error", "cancelled"].includes(item.status)) return;
    Object.assign(item, { status: "waiting", progress: 0, error: undefined, bytesLoaded: 0, speed: 0, eta: null });
    sync();
    pump();
  }, [pump, sync]);
  const clearCompleted = useCallback(() => {
    items.current = items.current.filter((item) => item.status !== "done" && item.status !== "cancelled");
    sync();
  }, [sync]);

  return { uploads, paused: paused.current, enqueue, pause, resume, cancel, retry, clearCompleted };
}
