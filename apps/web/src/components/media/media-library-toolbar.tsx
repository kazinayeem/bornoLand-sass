"use client";

import { Search, SlidersHorizontal, Upload } from "lucide-react";
import { StorageUsageBar } from "@/components/media/storage-usage-bar";
import type { StorageStats } from "@/redux/api/media-api";

export type MediaFileFilter =
  | "all"
  | "image"
  | "video"
  | "document"
  | "pdf"
  | "svg"
  | "audio"
  | "archive"
  | "other"
  | "unused"
  | "used";

export type MediaSortOption = "newest" | "oldest" | "largest" | "smallest" | "name-asc" | "name-desc";

export const MEDIA_FILTER_OPTIONS: { value: MediaFileFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "Documents" },
  { value: "svg", label: "SVG" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Archives" },
  { value: "other", label: "Other" },
];

export const MEDIA_SORT_OPTIONS: { value: MediaSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "largest", label: "Largest" },
  { value: "smallest", label: "Smallest" },
  { value: "name-asc", label: "Name" },
  { value: "name-desc", label: "Name (Z–A)" },
];

export function mapMediaFilterToQuery(filter: MediaFileFilter): {
  fileType?: string;
  mimeType?: string;
  usage?: string;
} {
  if (filter === "unused") return { usage: "unused" };
  if (filter === "used") return { usage: "used" };
  if (filter === "all") return {};
  if (filter === "svg") return { mimeType: "image/svg+xml" };
  if (filter === "pdf") return { fileType: "pdf" };
  if (filter === "archive") return { fileType: "archive" };
  return { fileType: filter };
}

type MediaLibraryToolbarProps = {
  title?: string;
  stats?: StorageStats;
  billingHref?: string;
  search: string;
  onSearchChange: (value: string) => void;
  fileFilter: MediaFileFilter;
  onFilterChange: (value: MediaFileFilter) => void;
  sortOption: MediaSortOption;
  onSortChange: (value: MediaSortOption) => void;
  onUploadClick: () => void;
  totalCount?: number;
  compact?: boolean;
  showTitle?: boolean;
};

export function MediaLibraryToolbar({
  title = "Media Library",
  stats,
  billingHref,
  search,
  onSearchChange,
  fileFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  onUploadClick,
  totalCount,
  compact,
  showTitle = true,
}: MediaLibraryToolbarProps) {
  return (
    <div className="space-y-4">
      {showTitle && !compact && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {totalCount != null ? `${totalCount} files` : "All your store files in one place"}
            </p>
          </div>
          {stats && <StorageUsageBar stats={stats} billingHref={billingHref} compact />}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm sm:p-4">
        {!showTitle && stats && !compact && (
          <StorageUsageBar stats={stats} billingHref={billingHref} compact />
        )}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search filename, extension, mime type…"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <select
                value={fileFilter}
                onChange={(e) => onFilterChange(e.target.value as MediaFileFilter)}
                className="h-10 appearance-none rounded-xl border border-zinc-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              >
                {MEDIA_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as MediaSortOption)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {MEDIA_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onUploadClick}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </div>

        {compact && stats && (
          <div className="border-t border-zinc-100 pt-3">
            <StorageUsageBar stats={stats} billingHref={billingHref} compact />
          </div>
        )}
      </div>
    </div>
  );
}
