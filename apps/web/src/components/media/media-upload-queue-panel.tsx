"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Pause, Play, RotateCcw, X, XCircle } from "lucide-react";
import { formatBytes } from "@/redux/api/media-api";
import type { UploadProgress, UploadQueueHandle } from "@/lib/media-upload";

function formatSpeed(bytesPerSec: number) {
  if (bytesPerSec <= 0) return "—";
  return `${formatBytes(bytesPerSec)}/s`;
}

function formatEta(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  return `${Math.ceil(seconds / 60)}m`;
}

function statusLabel(status: UploadProgress["status"]) {
  switch (status) {
    case "waiting":
      return "Waiting…";
    case "uploading":
      return "Uploading…";
    case "done":
      return "Completed";
    case "error":
      return "Failed";
    case "cancelled":
      return "Cancelled";
  }
}

export function MediaUploadQueuePanel({
  uploads,
  queueHandle,
  paused,
  onPause,
  onResume,
  onClose,
}: {
  uploads: UploadProgress[];
  queueHandle: UploadQueueHandle | null;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
}) {
  const active = uploads.some((u) => u.status === "uploading" || u.status === "waiting");
  const hasErrors = uploads.some((u) => u.status === "error");

  if (uploads.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className="overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas"
      >
        <div className="flex items-center justify-between gap-3 border-b border-apple-divider-soft bg-apple-canvas-parchment/80 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-apple-ink">
              {active ? "Uploading…" : hasErrors ? "Upload finished with errors" : "Upload complete"}
            </p>
            <p className="text-xs text-apple-ink-muted-48">
              {uploads.filter((u) => u.status === "done").length} of {uploads.length} files
            </p>
          </div>
          <div className="flex items-center gap-1">
            {active && queueHandle && (
              paused ? (
                <button type="button" onClick={onResume} className="rounded-lg p-2 text-apple-ink-muted-80 hover:bg-white" title="Resume">
                  <Play className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={onPause} className="rounded-lg p-2 text-apple-ink-muted-80 hover:bg-white" title="Pause">
                  <Pause className="h-4 w-4" />
                </button>
              )
            )}
            {queueHandle && active && (
              <button
                type="button"
                onClick={() => queueHandle.cancelAll()}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Cancel all
              </button>
            )}
            {!active && (
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-apple-ink-muted-48 hover:bg-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-72 divide-y divide-zinc-100 overflow-y-auto">
          {uploads.map((item) => (
            <div key={item.id} className="space-y-2 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-apple-ink">{item.fileName}</p>
                  <p className="text-xs text-apple-ink-muted-48">{statusLabel(item.status)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {item.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {item.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                  {item.status === "error" && queueHandle && (
                    <button
                      type="button"
                      onClick={() => queueHandle.retry(item.id)}
                      className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                      title="Retry"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {(item.status === "waiting" || item.status === "uploading") && queueHandle && (
                    <button
                      type="button"
                      onClick={() => queueHandle.cancel(item.id)}
                      className="rounded-lg p-1.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span className="w-10 text-right text-xs font-semibold tabular-nums text-apple-ink-muted-80">
                    {item.status === "waiting" ? "—" : `${item.progress}%`}
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-apple-canvas-parchment">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    item.status === "error"
                      ? "bg-red-500"
                      : item.status === "done"
                        ? "bg-emerald-500"
                        : item.status === "cancelled"
                          ? "bg-zinc-300"
                          : "bg-blue-600"
                  }`}
                />
              </div>

              {item.status === "uploading" && (
                <div className="flex flex-wrap gap-x-4 text-[11px] text-apple-ink-muted-48">
                  <span>
                    {formatBytes(item.bytesLoaded)} / {formatBytes(item.bytesTotal)}
                  </span>
                  <span>Speed {formatSpeed(item.speed)}</span>
                  <span>ETA {formatEta(item.eta)}</span>
                </div>
              )}

              {item.error && <p className="text-xs text-red-600">{item.error}</p>}
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
