"use client";

import { Image, FileText, Film, HardDrive, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import type { TabHelpers } from "./types";

export function MediaTab({ helpers }: { helpers: TabHelpers }) {
  const { mediaData, isLoading, resetStore } = helpers;
  const data = mediaData as Record<string, unknown> | undefined;

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
      </div>
    );
  }

  const total = Number(data?.total ?? 0);
  const imageCount = Number(data?.imageCount ?? 0);
  const videoCount = Number(data?.videoCount ?? 0);
  const docCount = Number(data?.docCount ?? 0);
  const storage = data?.storage as Record<string, unknown> | undefined;
  const recentMedia = (data?.recentMedia as Array<Record<string, unknown>>) ?? [];

  const formatBytes = (bytes: number): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleResetStorage = async () => {
    try {
      await resetStore("storage");
      toast.success("Storage reset");
    } catch {
      toast.error("Failed to reset storage");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Image className="h-5 w-5 text-blue-500" />
          <p className="mt-2 text-2xl font-bold text-apple-ink">{imageCount}</p>
          <p className="text-xs text-apple-ink-muted-48">Images</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <Film className="h-5 w-5 text-purple-500" />
          <p className="mt-2 text-2xl font-bold text-apple-ink">{videoCount}</p>
          <p className="text-xs text-apple-ink-muted-48">Videos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <FileText className="h-5 w-5 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-apple-ink">{docCount}</p>
          <p className="text-xs text-apple-ink-muted-48">Documents</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <HardDrive className="h-5 w-5 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold text-apple-ink">
            {formatBytes(Number((storage as Record<string, unknown>)?.usedBytes ?? 0))}
          </p>
          <p className="text-xs text-apple-ink-muted-48">Storage Used</p>
        </div>
      </div>

      {/* Recent Media */}
      {recentMedia.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h4 className="text-sm font-semibold text-apple-ink-muted-80">Recent Media</h4>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {recentMedia.slice(0, 16).map((file, i) => {
              const url = (file.url as string) || (file.storagePath as string) || "";
              const mime = (file.mimeType as string) || "";
              const isImage = mime.startsWith("image/");
              return (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-100 bg-apple-canvas-parchment">
                  {isImage ? (
                    <img
                      src={url}
                      alt={(file.name as string) ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <FileText className="h-6 w-6 text-zinc-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end bg-black/0 p-1 transition-colors group-hover:bg-black/30">
                    <p className="truncate text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {file.name as string}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h4 className="text-sm font-semibold text-apple-ink-muted-80">Media Actions</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <LoadingButton
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={handleResetStorage}
          >
            Recalculate Storage
          </LoadingButton>
          <LoadingButton
            size="sm"
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => toast.info("Empty recycle bin would delete trashed files")}
          >
            Empty Recycle Bin
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}
