"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useBulkDeleteMediaMutation,
  useDeleteMediaFileMutation,
  useGetMediaFilesQuery,
  useGetMediaUsageQuery,
  useRenameMediaFileMutation,
  useReplaceMediaFileMutation,
  type MediaFile,
} from "@/redux/api/media-api";
import { uploadMediaQueue, type UploadProgress, type UploadQueueHandle } from "@/lib/media-upload";
import { normalizeMediaFolder } from "@/lib/media-folders";
import { mediaCopyUrl } from "@/lib/media-file-helpers";
import { isImage } from "@/lib/media-file-helpers";
import { formatUsageSummary } from "@/lib/media-usage-labels";
import { MediaLibraryToolbar, mapMediaFilterToQuery, type MediaFileFilter, type MediaSortOption } from "@/components/media/media-library-toolbar";
import { MediaLibraryGrid } from "@/components/media/media-library-grid";
import { MediaLibraryPagination } from "@/components/media/media-library-pagination";
import { MediaUploadQueuePanel } from "@/components/media/media-upload-queue-panel";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaPreviewViewer } from "@/components/media/media-preview-viewer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE = 24;

export function MediaLibrary({
  storeId,
  billingHref,
  folder = "products",
  sort: pickerSort,
  onSelect,
  selectable,
  pickerMode,
}: {
  storeId: string;
  billingHref: string;
  folder?: string;
  sort?: string;
  onSelect?: (file: MediaFile) => void;
  selectable?: boolean;
  pickerMode?: boolean;
  /** @deprecated Folder sidebar removed — kept for API compatibility */
  showFolderNav?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [queueHandle, setQueueHandle] = useState<UploadQueueHandle | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [renameTarget, setRenameTarget] = useState<MediaFile | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [replaceTarget, setReplaceTarget] = useState<MediaFile | null>(null);
  const [fileFilter, setFileFilter] = useState<MediaFileFilter>("all");
  const [sortOption, setSortOption] = useState<MediaSortOption>("newest");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, fileFilter, sortOption, storeId, pickerSort]);

  const filterQuery = mapMediaFilterToQuery(fileFilter);

  const { data, isLoading, isFetching } = useGetMediaFilesQuery({
    storeId,
    search: debouncedSearch || undefined,
    sort: pickerSort === "recent" ? "newest" : sortOption,
    page: pickerSort === "recent" ? 1 : page,
    limit: pickerSort === "recent" ? 24 : PAGE_SIZE,
    ...filterQuery,
  });

  const files = data?.data?.files ?? [];
  const totalCount = data?.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const stats = data?.data?.globalStats ?? data?.data?.stats;
  const imageFiles = files.filter(isImage);

  const [deleteFile] = useDeleteMediaFileMutation();
  const [bulkDelete] = useBulkDeleteMediaMutation();
  const [renameFile] = useRenameMediaFileMutation();
  const [replaceFile] = useReplaceMediaFileMutation();

  const { data: usageData } = useGetMediaUsageQuery(
    { storeId, id: deleteTarget?._id ?? "" },
    { skip: !deleteTarget || !(deleteTarget.referenceCount ?? 0) },
  );

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const arr = Array.from(fileList);
      if (arr.length === 0) return;
      const uploadFolder = normalizeMediaFolder(folder);

      const { promise, handle } = uploadMediaQueue(storeId, arr, {
        folder: uploadFolder,
        onProgress: setUploads,
      });
      setQueueHandle(handle);
      setPaused(false);

      try {
        const result = await promise;
        const successCount = result.files.length;
        const errorCount = result.errors.length;
        if (successCount > 0) {
          toast.success(`Uploaded ${successCount} file${successCount === 1 ? "" : "s"}`);
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} file${errorCount === 1 ? "" : "s"} failed`);
        }
      } catch {
        toast.error("Upload failed");
      }
    },
    [storeId, folder],
  );

  const handleReplaceUpload = async (fileList: FileList | null) => {
    if (!replaceTarget || !fileList?.length) return;
    try {
      const { promise } = uploadMediaQueue(storeId, [fileList[0]], {
        folder: replaceTarget.folder || normalizeMediaFolder(folder),
      });
      const result = await promise;
      const newFile = (result.files as MediaFile[])?.[0];
      if (!newFile?._id) throw new Error("Upload did not return a file id");
      await replaceFile({ storeId, id: replaceTarget._id, newMediaFileId: newFile._id }).unwrap();
      toast.success("File replaced across all references");
      setReplaceTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Replace failed");
    }
  };

  const copyUrl = useCallback((file: MediaFile) => {
    void navigator.clipboard.writeText(mediaCopyUrl(file));
    setCopiedId(file._id);
    toast.success("Copied ✓");
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const openPreview = useCallback(
    (file: MediaFile) => {
      if (isImage(file)) {
        const idx = imageFiles.findIndex((f) => f._id === file._id);
        setPreviewIndex(idx >= 0 ? idx : 0);
        setPreviewFile(file);
      } else {
        setPreviewFile(file);
        setPreviewIndex(0);
      }
    },
    [imageFiles],
  );

  const submitRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await renameFile({ storeId, id: renameTarget._id, displayName: renameValue.trim() }).unwrap();
      toast.success("File renamed");
      setRenameTarget(null);
      if (previewFile?._id === renameTarget._id) {
        setPreviewFile({ ...previewFile, displayName: renameValue.trim() });
      }
    } catch {
      toast.error("Rename failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const force = (deleteTarget.referenceCount ?? 0) > 0;
    try {
      await deleteFile({ storeId, id: deleteTarget._id, force }).unwrap();
      toast.success(force ? "File force deleted" : "File deleted");
      setDeleteTarget(null);
      if (previewFile?._id === deleteTarget._id) setPreviewFile(null);
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? String((error as { data?: { message?: string } }).data?.message ?? "Delete failed")
          : "Delete failed";
      toast.error(message);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) void handleUpload(e.dataTransfer.files);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    await bulkDelete({ storeId, fileIds: Array.from(selected) });
    setSelected(new Set());
    toast.success("Files deleted");
  };

  const showEmpty = !isLoading && files.length === 0;
  const showGrid = files.length > 0;

  return (
    <div
      className="space-y-5"
      onDragOver={(e) => {
        if (pickerMode) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={pickerMode ? undefined : onDrop}
    >
      <MediaLibraryToolbar
        showTitle={false}
        compact={pickerMode}
        stats={stats}
        billingHref={billingHref}
        search={search}
        onSearchChange={setSearch}
        fileFilter={fileFilter}
        onFilterChange={setFileFilter}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onUploadClick={() => inputRef.current?.click()}
        totalCount={totalCount}
      />

      <MediaUploadQueuePanel
        uploads={uploads}
        queueHandle={queueHandle}
        paused={paused}
        onPause={() => {
          queueHandle?.pause();
          setPaused(true);
        }}
        onResume={() => {
          queueHandle?.resume();
          setPaused(false);
        }}
        onClose={() => {
          setUploads([]);
          setQueueHandle(null);
        }}
      />

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-4 py-2.5">
          <span className="text-sm text-zinc-700">{selected.size} selected</span>
          <button
            type="button"
            onClick={() => void handleBulkDelete()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete selected
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-sm text-zinc-500 hover:text-zinc-700">
            Clear
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf,.docx,.xlsx,.pptx,.zip,video/*,audio/*"
        onChange={(e) => e.target.files && void handleUpload(e.target.files)}
      />

      {isLoading ? (
        <MediaGridSkeleton count={PAGE_SIZE} />
      ) : showEmpty ? (
        <MediaEmptyState
          dragOver={dragOver}
          onUpload={pickerMode ? undefined : () => inputRef.current?.click()}
        />
      ) : showGrid ? (
        <>
          <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
            <MediaLibraryGrid
              files={files}
              selectedIds={selected}
              copiedId={copiedId}
              selectable={selectable}
              onToggleSelect={toggleSelect}
              onPreview={openPreview}
              onCopy={copyUrl}
              onRename={(file) => {
                setRenameTarget(file);
                setRenameValue(file.displayName || file.originalName);
              }}
              onDelete={setDeleteTarget}
              onSelect={selectable ? onSelect : undefined}
            />
          </div>

          {pickerSort !== "recent" && (
            <MediaLibraryPagination
              page={page}
              totalPages={totalPages}
              total={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </>
      ) : null}

      <input
        ref={replaceInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.docx,.xlsx,.pptx,.zip"
        onChange={(e) => void handleReplaceUpload(e.target.files)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete file"
        message={
          deleteTarget && (deleteTarget.referenceCount ?? 0) > 0
            ? `This file is used in: ${formatUsageSummary(usageData?.data?.usage?.byEntityType ?? {}) || `${deleteTarget.referenceCount ?? 0} place(s)`}. Delete anyway?`
            : `Delete "${deleteTarget?.displayName || deleteTarget?.originalName}"? This cannot be undone.`
        }
        confirmLabel={(deleteTarget?.referenceCount ?? 0) > 0 ? "Delete anyway" : "Delete"}
        variant="danger"
      />

      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename file" size="sm">
        <input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && void submitRename()}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setRenameTarget(null)} className="rounded-xl border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submitRename()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      </Modal>

      <MediaPreviewViewer
        file={previewFile}
        files={previewFile && isImage(previewFile) ? imageFiles : undefined}
        index={previewIndex}
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onNavigate={(idx) => {
          setPreviewIndex(idx);
          setPreviewFile(imageFiles[idx] ?? null);
        }}
        onDelete={setDeleteTarget}
        onRename={(file) => {
          setRenameTarget(file);
          setRenameValue(file.displayName || file.originalName);
        }}
      />
    </div>
  );
}
