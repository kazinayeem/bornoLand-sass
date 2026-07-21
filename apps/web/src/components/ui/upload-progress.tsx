"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadFileItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  speed?: number;
  remaining?: number;
};

type UploadProgressProps = {
  files: UploadFileItem[];
  onClear: () => void;
  onRemove: (id: string) => void;
  minimal?: boolean;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function UploadProgress({ files, onClear, onRemove, minimal }: UploadProgressProps) {
  const activeCount = files.filter((f) => f.status === "pending" || f.status === "uploading").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const loadedSize = files.reduce((acc, f) => acc + Math.round(f.size * (f.progress / 100)), 0);
  const overallProgress = totalSize > 0 ? Math.round((loadedSize / totalSize) * 100) : 0;
  const hasError = files.some((f) => f.status === "error");
  const isComplete = files.every((f) => f.status === "done" || f.status === "error");

  if (files.length === 0) return null;

  if (minimal) {
    return (
      <div className={cn(
        "rounded-xl border px-3 py-2 text-sm",
        isComplete && !hasError ? "border-emerald-200 bg-emerald-50" :
        hasError ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isComplete ? (
              hasError ? <AlertCircle className="h-4 w-4 shrink-0 text-red-500" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" />
            )}
            <span className="truncate text-xs font-medium">
              {activeCount > 0
                ? `Uploading ${activeCount} file${activeCount > 1 ? "s" : ""}...`
                : `${doneCount} file${doneCount > 1 ? "s" : ""} uploaded`}
            </span>
          </div>
          {!isComplete && <span className="shrink-0 text-xs text-apple-ink-muted-48">{overallProgress}%</span>}
        </div>
        {!isComplete && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/60">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-apple-hairline bg-apple-canvas">
      <div className="flex items-center justify-between border-b border-apple-divider-soft px-4 py-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-apple-ink-muted-48" />
          <span className="text-sm font-medium text-apple-ink-muted-80">
            {activeCount > 0
              ? `Uploading ${activeCount} file${activeCount > 1 ? "s" : ""}`
              : `${doneCount} file${doneCount > 1 ? "s" : ""} uploaded`}
          </span>
          {!isComplete && (
            <span className="text-xs text-apple-ink-muted-48">({overallProgress}%)</span>
          )}
        </div>
        <button onClick={onClear} className="rounded-sm p-1 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="divide-y divide-apple-divider-soft">
        {files.map((file) => (
          <div key={file.id} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {file.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : file.status === "error" ? (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-apple-ink-muted-80">{file.name}</p>
                  <p className="text-xs text-apple-ink-muted-48">
                    {file.status === "uploading" && file.speed != null
                      ? `${formatSpeed(file.speed)}`
                      : formatBytes(file.size)}
                    {file.status === "uploading" && file.remaining != null && file.remaining > 0
                      ? ` · ${formatTime(file.remaining)} remaining`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {file.status === "uploading" && (
                  <span className="text-xs font-medium text-blue-600">{file.progress}%</span>
                )}
                {file.status === "error" && file.error && (
                  <span className="text-xs text-red-500">{file.error}</span>
                )}
                {file.status !== "uploading" && file.status !== "pending" && (
                  <button onClick={() => onRemove(file.id)} className="rounded-sm p-1 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {(file.status === "pending" || file.status === "uploading") && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${file.progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            )}

            {/* Indeterminate progress when pending */}
            {file.status === "pending" && file.progress === 0 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-apple-canvas-parchment">
                <motion.div
                  className="h-full rounded-full bg-blue-400"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  style={{ width: "40%" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hook for managing upload state ─────────────────────────────
export function useUploadState() {
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const speeds = useRef<Map<string, number[]>>(new Map());

  const addFile = useCallback((name: string, size: number) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const file: UploadFileItem = { id, name, size, progress: 0, status: "pending" };
    setFiles((prev) => [...prev, file]);
    return id;
  }, []);

  const updateProgress = useCallback((id: string, progress: number, loadedBytes?: number) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        if (loadedBytes != null && f.size > 0) {
          const now = Date.now();
          const prevSpeeds = speeds.current.get(id) || [];
          speeds.current.set(id, [...prevSpeeds.slice(-5), loadedBytes]);
          const avgSpeed = prevSpeeds.length > 0
            ? (loadedBytes - prevSpeeds[0]) / (prevSpeeds.length * 0.1)
            : 0;
          const remaining = avgSpeed > 0 ? (f.size - loadedBytes) / avgSpeed : 0;
          return { ...f, progress, status: "uploading" as const, speed: avgSpeed, remaining };
        }
        return { ...f, progress, status: "uploading" as const };
      })
    );
  }, []);

  const completeFile = useCallback((id: string, error?: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, progress: error ? f.progress : 100, status: error ? ("error" as const) : ("done" as const), error } : f))
    );
    speeds.current.delete(id);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    speeds.current.delete(id);
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    speeds.current.clear();
  }, []);

  return { files, addFile, updateProgress, completeFile, removeFile, clearAll };
}
