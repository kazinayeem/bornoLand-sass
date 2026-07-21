"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ImagePlus, Library, RefreshCw, Upload, Loader2, X, Search,
  Image, Video, FileText, Clock, Star, ChevronLeft, ChevronRight,
  Trash2, Link, ExternalLink,
} from "lucide-react";
import type { MediaFile } from "@/redux/api/media-api";
import {
  formatBytes,
  useDeleteMediaFileMutation,
  useGetMediaFileQuery,
  useGetMediaFilesQuery,
  useImportMediaFromUrlMutation,
} from "@/redux/api/media-api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import {
  mediaSelectionFromFile,
  selectionMediaId,
  selectionUrl,
  type MediaSelection,
} from "@/lib/media-selection";
import { uploadMediaWithProgress, type UploadProgress } from "@/lib/media-upload";
import { toast } from "sonner";
import { SmartImage } from "@/components/ui/smart-image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

type SidebarFilter = "all" | "images" | "videos" | "documents" | "recent" | "favorites";

const SIDEBAR_ITEMS: { id: SidebarFilter; label: string; icon: typeof Image }[] = [
  { id: "all", label: "All", icon: Image },
  { id: "images", label: "Images", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "favorites", label: "Favorites", icon: Star },
];

function fileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url, "https://placeholder.local").pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : "Selected image";
  } catch {
    const segment = url.split("/").filter(Boolean).pop();
    return segment ? decodeURIComponent(segment) : "Selected image";
  }
}

function selectionMeta(value?: string | MediaSelection | null, fetchedFile?: MediaFile | null) {
  const selection = typeof value === "string" ? (value ? { url: value } : undefined) : value?.url ? value : undefined;
  if (!selection) return null;

  const file = selection.file ?? fetchedFile ?? undefined;
  const name = file?.displayName || file?.originalName || fileNameFromUrl(selection.url);
  const size = file?.size ? formatBytes(file.size) : "";
  const dimensions =
    file?.width && file?.height
      ? `${file.width} × ${file.height}`
      : "";

  return { name, size, dimensions };
}

export function MediaPicker({
  storeId,
  billingHref,
  value,
  onChange,
  folder = "products",
  label = "Image",
  compact = false,
  hideLabel = false,
}: {
  storeId: string;
  billingHref: string;
  value?: string | MediaSelection | null;
  onChange: (selection: MediaSelection) => void;
  folder?: string;
  label?: string;
  compact?: boolean;
  hideLabel?: boolean;
}) {
  // ─── Wrapper state ──────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // ─── Modal state ─────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>("all");
  const [page, setPage] = useState(1);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [showUploadDrop, setShowUploadDrop] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [importMediaFromUrl, { isLoading: isImporting }] = useImportMediaFromUrlMutation();
  const [deleteFile] = useDeleteMediaFileMutation();

  // ─── Current selection info (for the wrapper preview) ──────
  const previewUrl = selectionUrl(value);
  const mediaId = selectionMediaId(value);
  const { data: mediaFileData } = useGetMediaFileQuery(
    { storeId, id: mediaId ?? "" },
    { skip: !mediaId || Boolean(typeof value === "object" && value?.file) },
  );
  const fetchedFile = mediaFileData?.data?.file;
  const meta = selectionMeta(value, fetchedFile);

  // ─── Debounce search ───────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sidebarFilter]);

  // ─── Build query params from filter ────────────────────────
  const filterQuery = useMemo(() => {
    switch (sidebarFilter) {
      case "images": return { fileType: "image" };
      case "videos": return { fileType: "video" };
      case "documents": return { fileType: "document" };
      case "recent": return { sort: "newest" };
      default: return {};
    }
  }, [sidebarFilter]);

  // ─── Fetch files ─────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useGetMediaFilesQuery({
    storeId,
    search: debouncedSearch || undefined,
    sort: sidebarFilter === "recent" ? "newest" : undefined,
    page,
    limit: PAGE_SIZE,
    ...filterQuery,
  });

  const files = data?.data?.files ?? [];
  const totalCount = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // ─── Scroll lock + Escape key ────────────────────────────
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); } };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  // ─── Reset modal state when opened ────────────────────────
  const openPicker = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setSidebarFilter("all");
    setPage(1);
    setPreviewFile(null);
    setShowUploadDrop(false);
    setImportUrl("");
    setUploads([]);
    setOpen(true);
  }, []);

  // ─── Handlers ────────────────────────────────────────────

  const handleSelect = useCallback((file: MediaFile) => {
    onChange(mediaSelectionFromFile(file));
    setOpen(false);
  }, [onChange]);

  const handleClickFile = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const handleDoubleClick = (file: MediaFile) => {
    handleSelect(file);
  };

  const handleUpload = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (arr.length === 0) return;
    try {
      const result = await uploadMediaWithProgress(storeId, arr, { folder, onProgress: setUploads });
      const uploaded = (result.files ?? []) as MediaFile[];
      if (uploaded[0]) {
        await refetch();
        setPreviewFile(uploaded[0]);
        setShowUploadDrop(false);
        toast.success("Image uploaded");
      }
      setTimeout(() => setUploads([]), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  }, [storeId, folder, refetch]);

  const handleImportUrlAction = useCallback(async () => {
    const url = importUrl.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error("Invalid URL format. Please enter a valid URL.");
      return;
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://");
      return;
    }
    try {
      const result = await importMediaFromUrl({ storeId, url, folder }).unwrap();
      if (result.data?.file) {
        await refetch();
        setPreviewFile(result.data.file as MediaFile);
        setImportUrl("");
        setShowUploadDrop(false);
        toast.success("Image imported from URL");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    }
  }, [importUrl, importMediaFromUrl, storeId, folder, refetch]);

  const handleDelete = useCallback(async (file: MediaFile) => {
    if (!confirm(`Delete "${file.displayName || file.originalName}"?`)) return;
    try {
      await deleteFile({ storeId, id: file._id }).unwrap();
      toast.success("File deleted");
      setPreviewFile(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }, [deleteFile, storeId, refetch]);

  // ─── Wrapper view ─────────────────────────────────────────

  const wrapperPreviewSize = compact ? "h-16 w-16" : "h-20 w-20";

  const wrapper = (
    <div className="space-y-2">
      {!hideLabel && <label className="text-sm font-medium text-apple-ink-muted-80">{label}</label>}

      <div className="flex flex-wrap items-start gap-3">
        {previewUrl ? (
          <div className={cn("relative shrink-0 overflow-hidden rounded-xl border", wrapperPreviewSize)}>
            <SmartImage
              src={resolveMediaUrl(previewUrl)}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className={cn("flex shrink-0 items-center justify-center rounded-xl border border-dashed border-apple-hairline bg-apple-canvas-parchment text-apple-ink-muted-48", wrapperPreviewSize)}>
            <ImagePlus className={compact ? "h-5 w-5" : "h-6 w-6"} />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          {meta && (
            <div className="space-y-0.5">
              <p className="truncate text-[11px] font-medium text-zinc-800">{meta.name}</p>
              {(meta.size || meta.dimensions) && (
                <p className="text-[10px] text-apple-ink-muted-48">
                  {[meta.size, meta.dimensions].filter(Boolean).join(" \u00B7 ")}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openPicker}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border border-apple-hairline font-medium hover:bg-apple-canvas-parchment",
                compact ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2 text-sm"
              )}
            >
              <Library className={compact ? "h-3 w-3" : "h-4 w-4"} />
              {previewUrl ? "Open Media Library" : "Choose Image"}
            </button>

            {previewUrl && (
              <>
                <button
                  type="button"
                  onClick={openPicker}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border border-apple-hairline font-medium hover:bg-apple-canvas-parchment",
                    compact ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-sm"
                  )}
                >
                  <RefreshCw className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ url: "" })}
                  className={compact ? "text-[11px] text-red-600" : "text-sm text-red-600"}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Portal-based modal ──────────────────────────────────────
  const modal = open ? (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative flex w-full flex-col overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas"
            style={{ height: "85vh", maxHeight: "85vh", maxWidth: "min(1200px, 95vw)" }}
          >
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex shrink-0 items-center gap-3 border-b border-apple-divider-soft px-5 py-3">
              <h2 className="text-base font-semibold text-apple-ink whitespace-nowrap">Media Library</h2>

              <div className="relative min-w-0 flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-apple-ink-muted-48" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search files..."
                  className="h-8 w-full rounded-lg border border-apple-hairline bg-apple-canvas-parchment pl-8 pr-3 text-xs outline-none focus:border-zinc-400 focus:bg-apple-canvas"
                />
              </div>

              <button
                type="button"
                onClick={() => uploadInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
              <input
                ref={uploadInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf,.docx,.xlsx,.pptx,.zip,video/*,audio/*"
                onChange={(e) => e.target.files && handleUpload(e.target.files)}
              />

              <button
                type="button"
                onClick={() => { setShowUploadDrop(!showUploadDrop); setImportUrl(""); }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  showUploadDrop
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-apple-hairline text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                )}
              >
                <Link className="h-3.5 w-3.5" />
                Import URL
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Upload / Import URL inline area */}
            <AnimatePresence>
              {showUploadDrop && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-b border-apple-divider-soft"
                >
                  <div className="flex gap-3 p-4 bg-apple-canvas-parchment">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleUpload(e.dataTransfer.files); }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
                        dragOver ? "border-zinc-900 bg-apple-canvas-parchment" : "border-apple-hairline"
                      )}
                    >
                      <Upload className="h-5 w-5 text-apple-ink-muted-48 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-apple-ink-muted-80">Drag & drop or click to browse</p>
                        <p className="text-[10px] text-apple-ink-muted-48 mt-0.5">Images are optimized automatically</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => uploadInputRef.current?.click()}
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-white shrink-0"
                      >
                        Browse
                      </button>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-apple-hairline bg-apple-canvas px-3 py-2">
                      <Link className="h-4 w-4 text-apple-ink-muted-48 shrink-0" />
                      <input
                        ref={importInputRef}
                        type="url"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="Paste image URL..."
                        className="min-w-0 flex-1 text-xs outline-none placeholder:text-zinc-300"
                        onKeyDown={(e) => e.key === "Enter" && handleImportUrlAction()}
                      />
                      <button
                        type="button"
                        onClick={handleImportUrlAction}
                        disabled={isImporting || !importUrl.trim()}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50 shrink-0"
                      >
                        {isImporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                        Import
                      </button>
                    </div>
                  </div>

                  {uploads.length > 0 && (
                    <div className="border-t border-apple-divider-soft bg-apple-canvas px-4 py-2">
                      {uploads.map((u) => (
                        <div key={u.fileName} className="flex items-center gap-2 text-[11px] text-apple-ink-muted-80">
                          <div className="h-1.5 flex-1 rounded-full bg-apple-canvas-parchment overflow-hidden">
                            <div className="h-full bg-zinc-900 rounded-full transition-all" style={{ width: `${u.progress}%` }} />
                          </div>
                          <span className="shrink-0 w-8 text-right">{u.progress}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Body: Sidebar + Grid + Preview ──────────────── */}

            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-apple-divider-soft px-4 py-2 lg:hidden">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSidebarFilter(item.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap",
                    sidebarFilter === item.id ? "bg-zinc-900 text-white" : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                  )}
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-1 overflow-hidden">
              <aside className="hidden w-44 shrink-0 border-r border-apple-divider-soft bg-apple-canvas-parchment/50 p-2 lg:block">
                <nav className="space-y-0.5">
                  {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSidebarFilter(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition",
                        sidebarFilter === item.id
                          ? "bg-apple-canvas text-apple-ink"
                          : "text-apple-ink-muted-80 hover:bg-apple-canvas/60"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-4 border-t border-apple-hairline pt-3 px-3">
                  <p className="text-[10px] text-apple-ink-muted-48">{totalCount} files</p>
                </div>
              </aside>

              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                    </div>
                  ) : files.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <Image className="mb-3 h-10 w-10 text-zinc-200" />
                      <p className="text-sm font-medium text-apple-ink-muted-80">No files found</p>
                      <p className="mt-1 text-xs text-apple-ink-muted-48">Upload an image or adjust your search</p>
                    </div>
                  ) : (
                    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                      {files.map((file) => (
                        <button
                          key={file._id}
                          type="button"
                          onClick={() => handleClickFile(file)}
                          onDoubleClick={() => handleDoubleClick(file)}
                          className={cn(
                            "group relative aspect-square overflow-hidden rounded-xl border-2 bg-apple-canvas-parchment text-left transition-all",
                            previewFile?._id === file._id
                              ? "border-zinc-900 ring-2 ring-zinc-900/20"
                              : "border-apple-divider-soft hover:border-zinc-300"
                          )}
                        >
                          {file.fileType === "image" ? (
                            <img
                              src={resolveMediaUrl(file.thumbnailUrl || file.publicUrl)}
                              alt={file.displayName || file.originalName}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <FileText className="h-8 w-8 text-zinc-300" />
                            </div>
                          )}

                          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2">
                              <p className="truncate text-[10px] font-medium text-white drop-shadow-sm">
                                {file.displayName || file.originalName}
                              </p>
                            </div>
                          </div>

                          {previewFile?._id === file._id && (
                            <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white">
                              <div className="h-2 w-2 rounded-full bg-apple-canvas" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex shrink-0 items-center justify-between border-t border-apple-divider-soft px-4 py-2.5">
                    <p className="text-[11px] text-apple-ink-muted-48">Page {page} of {totalPages}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!hasPrevPage}
                        onClick={() => setPage((p) => p - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                        const p = start + i;
                        if (p > totalPages) return null;
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={cn(
                              "flex h-7 min-w-[28px] items-center justify-center rounded-lg px-1.5 text-[11px] font-medium",
                              page === p ? "bg-zinc-900 text-white" : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
                            )}
                          >
                            {p}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={!hasNextPage}
                        onClick={() => setPage((p) => p + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-apple-ink-muted-80 hover:bg-apple-canvas-parchment disabled:opacity-30"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {previewFile && (
                <aside className="hidden w-72 shrink-0 border-l border-apple-divider-soft bg-apple-canvas-parchment/50 p-4 lg:flex lg:flex-col">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-apple-hairline bg-apple-canvas">
                    {previewFile.fileType === "image" ? (
                      <img
                        src={resolveMediaUrl(previewFile.publicUrl)}
                        alt={previewFile.displayName || previewFile.originalName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-12 w-12 text-zinc-300" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <p className="truncate text-sm font-medium text-apple-ink" title={previewFile.displayName || previewFile.originalName}>
                      {previewFile.displayName || previewFile.originalName}
                    </p>
                    <div className="space-y-1 text-[11px] text-apple-ink-muted-48">
                      {previewFile.width && previewFile.height && (
                        <p>{previewFile.width} x {previewFile.height}px</p>
                      )}
                      <p>{formatBytes(previewFile.size)}</p>
                      <p className="capitalize">{previewFile.fileType}</p>
                      <p>{new Date(previewFile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2 pt-4">
                    <button
                      type="button"
                      onClick={() => handleSelect(previewFile)}
                      className="w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition"
                    >
                      Use Image
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(previewFile)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </aside>
              )}
            </div>

            {previewFile && (
              <div className="flex shrink-0 items-center gap-3 border-t border-apple-divider-soft bg-apple-canvas px-4 py-3 lg:hidden">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-apple-hairline bg-apple-canvas-parchment">
                  {previewFile.fileType === "image" ? (
                    <img
                      src={resolveMediaUrl(previewFile.thumbnailUrl || previewFile.publicUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText className="h-5 w-5 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-apple-ink">
                    {previewFile.displayName || previewFile.originalName}
                  </p>
                  <p className="text-[10px] text-apple-ink-muted-48">
                    {previewFile.width && previewFile.height ? `${previewFile.width} x ${previewFile.height} \u00B7 ` : ""}
                    {formatBytes(previewFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(previewFile)}
                  className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Use Image
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(previewFile)}
                  className="rounded-xl border border-red-200 p-2 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  ) : null;

  return (
    <>
      {wrapper}
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
