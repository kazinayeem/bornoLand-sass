"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useBulkDeleteMediaMutation,
  useDeleteMediaFileMutation,
  useGetMediaFilesQuery,
  useGetMediaUsageQuery,
  useRenameMediaFileMutation,
  useReplaceMediaFileMutation,
  formatBytes,
  type MediaFile,
} from "@/redux/api/media-api";
import { uploadMediaWithProgress, type UploadProgress } from "@/lib/media-upload";
import { StorageUsageBar } from "@/components/media/storage-usage-bar";
import { MediaFolderNav } from "@/components/media/media-folder-nav";
import { SafeMediaImage } from "@/components/media/safe-media-image";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { MediaEmptyState } from "@/components/media/media-empty-state";
import { MediaLightbox } from "@/components/media/media-lightbox";
import { MediaPreviewModal } from "@/components/media/media-preview-modal";
import { MediaDetailsModal } from "@/components/media/media-details-modal";
import { normalizeMediaFolder } from "@/lib/media-folders";
import {
  fileTypeLabel,
  isImage,
  isOfficeDoc,
  isPdf,
  mediaCopyUrl,
  mediaDownloadHref,
  mediaThumbnailSrc,
} from "@/lib/media-file-helpers";
import {
  Copy,
  Download,
  Eye,
  FileArchive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Grid3X3,
  Info,
  List,
  MoreHorizontal,
  Pencil,
  Presentation,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { formatUsageSummary } from "@/lib/media-usage-labels";

type ViewMode = "grid" | "list";
type FileFilter = "all" | "image" | "document" | "pdf" | "video" | "audio" | "archive" | "unused" | "used";
type SortOption = "newest" | "oldest" | "largest" | "smallest" | "name-asc" | "name-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "largest", label: "Largest" },
  { value: "smallest", label: "Smallest" },
  { value: "name-asc", label: "A–Z" },
  { value: "name-desc", label: "Z–A" },
];

const FILTER_OPTIONS: { value: FileFilter; label: string }[] = [
  { value: "all", label: "All files" },
  { value: "image", label: "Images" },
  { value: "document", label: "Documents" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Archive" },
  { value: "unused", label: "Unused" },
  { value: "used", label: "Used" },
];

function mapFilterToQuery(filter: FileFilter): { fileType?: string; usage?: string } {
  if (filter === "unused") return { usage: "unused" };
  if (filter === "used") return { usage: "used" };
  if (filter === "all") return {};
  return { fileType: filter };
}

function FileTypeIcon({ file }: { file: MediaFile }) {
  const ext = file.extension.toLowerCase();
  if (file.fileType === "video") return <FileVideo className="h-10 w-10 text-violet-500" />;
  if (file.mimeType.startsWith("audio/")) return <FileAudio className="h-10 w-10 text-pink-500" />;
  if (["zip", "rar", "7z"].includes(ext)) return <FileArchive className="h-10 w-10 text-amber-500" />;
  if (ext === "xlsx") return <FileSpreadsheet className="h-10 w-10 text-emerald-600" />;
  if (ext === "pptx") return <Presentation className="h-10 w-10 text-orange-600" />;
  if (isOfficeDoc(file) || isPdf(file)) return <FileText className="h-10 w-10 text-blue-600" />;
  return <FileText className="h-10 w-10 text-zinc-400" />;
}

export function MediaLibrary({
  storeId,
  billingHref,
  folder = "products",
  sort: pickerSort,
  onSelect,
  selectable,
  pickerMode,
  showFolderNav = true,
}: {
  storeId: string;
  billingHref: string;
  folder?: string;
  sort?: string;
  onSelect?: (file: MediaFile) => void;
  selectable?: boolean;
  pickerMode?: boolean;
  showFolderNav?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [detailsFile, setDetailsFile] = useState<MediaFile | null>(null);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [renameTarget, setRenameTarget] = useState<MediaFile | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [replaceTarget, setReplaceTarget] = useState<MediaFile | null>(null);
  const [fileFilter, setFileFilter] = useState<FileFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [activeFolder, setActiveFolder] = useState<string | null>(() =>
    pickerMode ? normalizeMediaFolder(folder) : null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pickerMode && pickerSort !== "recent") {
      setActiveFolder(normalizeMediaFolder(folder));
    }
  }, [folder, pickerMode, pickerSort]);

  const queryFolder = pickerSort === "recent" ? undefined : activeFolder ?? undefined;
  const filterQuery = mapFilterToQuery(fileFilter);

  const { data, isLoading, isFetching, refetch } = useGetMediaFilesQuery({
    storeId,
    search: search || undefined,
    folder: queryFolder,
    sort: pickerSort === "recent" ? "newest" : sortOption,
    limit: 200,
    ...filterQuery,
  });

  const [deleteFile] = useDeleteMediaFileMutation();
  const [bulkDelete] = useBulkDeleteMediaMutation();
  const [renameFile] = useRenameMediaFileMutation();
  const [replaceFile] = useReplaceMediaFileMutation();

  const { data: usageData } = useGetMediaUsageQuery(
    { storeId, id: deleteTarget?._id ?? "" },
    { skip: !deleteTarget || !(deleteTarget.referenceCount ?? 0) }
  );

  const allFiles = data?.data?.files ?? [];
  const files =
    pickerSort === "recent" ? [...allFiles].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 24) : allFiles;
  const imageFiles = files.filter(isImage);
  const stats = data?.data?.stats;
  const globalStats = data?.data?.globalStats ?? stats;
  const totalCount = data?.data?.total ?? files.length;

  const requestDelete = (file: MediaFile) => setDeleteTarget(file);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const force = (deleteTarget.referenceCount ?? 0) > 0;
    try {
      await deleteFile({ storeId, id: deleteTarget._id, force }).unwrap();
      toast.success(force ? "File force deleted" : "File deleted");
      setDeleteTarget(null);
      setLightboxIndex(null);
    } catch (error) {
      const message =
        error && typeof error === "object" && "data" in error
          ? String((error as { data?: { message?: string } }).data?.message ?? "Delete failed")
          : "Delete failed";
      toast.error(message);
    }
  };

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const arr = Array.from(fileList);
      if (arr.length === 0) return;
      const uploadFolder = activeFolder ?? normalizeMediaFolder(folder);
      try {
        await uploadMediaWithProgress(storeId, arr, {
          folder: uploadFolder,
          onProgress: setUploads,
        });
        toast.success(`Uploaded ${arr.length} file(s)`);
        setTimeout(() => setUploads([]), 2000);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Upload failed");
      }
    },
    [storeId, activeFolder, folder]
  );

  const handleReplaceUpload = async (fileList: FileList | null) => {
    if (!replaceTarget || !fileList?.length) return;
    const uploadFolder = replaceTarget.folder || (activeFolder ?? normalizeMediaFolder(folder));
    try {
      const result = await uploadMediaWithProgress(storeId, [fileList[0]], { folder: uploadFolder });
      const newFile = (result.files as MediaFile[])?.[0];
      if (!newFile?._id) throw new Error("Upload did not return a file id");
      await replaceFile({ storeId, id: replaceTarget._id, newMediaFileId: newFile._id }).unwrap();
      toast.success("File replaced across all references");
      setReplaceTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Replace failed");
    }
  };

  const copyUrl = (file: MediaFile) => {
    void navigator.clipboard.writeText(mediaCopyUrl(file));
    toast.success("URL copied");
  };

  const openPreview = (file: MediaFile) => {
    if (isImage(file)) {
      const idx = imageFiles.findIndex((f) => f._id === file._id);
      setLightboxIndex(idx >= 0 ? idx : 0);
    } else {
      setPreviewFile(file);
    }
  };

  const submitRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await renameFile({ storeId, id: renameTarget._id, displayName: renameValue.trim() }).unwrap();
      toast.success("File renamed");
      setRenameTarget(null);
    } catch {
      toast.error("Rename failed");
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

  const folderNav =
    showFolderNav && pickerSort !== "recent" ? (
      <MediaFolderNav
        activeFolder={activeFolder}
        onChange={setActiveFolder}
        layout={pickerMode ? "horizontal" : "sidebar"}
      />
    ) : null;

  const mainContent = (
    <div className="min-w-0 flex-1 space-y-4">
      {!pickerMode && (
        <StorageUsageBar
          stats={
            stats && globalStats
              ? { ...globalStats, fileCount: stats.fileCount, imageCount: stats.imageCount, documentCount: stats.documentCount }
              : stats
          }
          billingHref={billingHref}
        />
      )}

      {pickerMode && folderNav}

      {!pickerMode && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
          }`}
        >
          <Upload className="mx-auto mb-2 h-8 w-8 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-900">Drag & drop files here</p>
          <p className="mt-1 text-xs text-zinc-500">JPG, PNG, WEBP, SVG, GIF, PDF, DOCX, XLSX, ZIP</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Upload from device
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            accept="image/*,.pdf,.docx,.xlsx,.pptx,.zip"
            onChange={(e) => e.target.files && void handleUpload(e.target.files)}
          />
        </div>
      )}

      {uploads.length > 0 && (
        <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
          {uploads.map((u) => (
            <div key={u.fileName} className="space-y-1">
              <div className="flex justify-between gap-2 text-xs">
                <span className="truncate text-zinc-700">{u.fileName}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {u.status === "error" ? (
                    <>
                      <span className="text-red-600">{u.error}</span>
                      <button
                        type="button"
                        onClick={() => void handleUpload([u.file])}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-0.5 text-red-700 hover:bg-red-50"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                      </button>
                    </>
                  ) : (
                    <span className="text-zinc-500">{`${u.progress}%`}</span>
                  )}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                <div
                  className={`h-full ${u.status === "error" ? "bg-red-500" : "bg-zinc-900"}`}
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type, extension…"
            className="h-10 w-full rounded-xl border border-zinc-200 pl-9 pr-3 text-sm"
          />
        </div>
        <select
          value={fileFilter}
          onChange={(e) => setFileFilter(e.target.value as FileFilter)}
          className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {pickerSort !== "recent" && (
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="h-10 rounded-xl border border-zinc-200 px-3 text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
        <div className="flex rounded-lg border border-zinc-200 p-1">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`rounded p-1.5 ${view === "grid" ? "bg-zinc-900 text-white" : ""}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded p-1.5 ${view === "list" ? "bg-zinc-900 text-white" : ""}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        {selected.size > 0 && (
          <button type="button" onClick={handleBulkDelete} className="inline-flex items-center gap-1 text-sm text-red-600">
            <Trash2 className="h-4 w-4" />
            Delete ({selected.size})
          </button>
        )}
        {!isLoading && (
          <span className="text-xs text-zinc-500">
            {totalCount} file{totalCount === 1 ? "" : "s"}
            {isFetching ? " · Updating…" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <MediaGridSkeleton />
      ) : files.length === 0 ? (
        <MediaEmptyState onUpload={pickerMode ? undefined : () => inputRef.current?.click()} />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <MediaCard
              key={file._id}
              file={file}
              selected={selected.has(file._id)}
              onToggle={() => toggleSelect(file._id)}
              onCopy={() => copyUrl(file)}
              onPreview={() => openPreview(file)}
              onDetails={() => setDetailsFile(file)}
              onRename={() => {
                setRenameTarget(file);
                setRenameValue(file.displayName || file.originalName);
              }}
              onReplace={() => {
                setReplaceTarget(file);
                replaceInputRef.current?.click();
              }}
              onDelete={() => requestDelete(file)}
              onSelect={selectable ? () => onSelect?.(file) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y rounded-xl border border-zinc-100">
          {files.map((file) => (
            <div key={file._id} className="flex items-center gap-3 p-3">
              <input type="checkbox" checked={selected.has(file._id)} onChange={() => toggleSelect(file._id)} />
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {isImage(file) ? (
                  <SafeMediaImage src={mediaThumbnailSrc(file)} alt={file.displayName} className="h-10 w-10" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileTypeIcon file={file} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.displayName || file.originalName}</p>
                <p className="text-xs text-zinc-500">
                  {formatBytes(file.size)} · {fileTypeLabel(file)}
                  {(file.referenceCount ?? 0) > 0 && ` · Used ${file.referenceCount}×`}
                </p>
              </div>
              <button type="button" onClick={() => openPreview(file)} className="text-zinc-500 hover:text-zinc-900">
                <Eye className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => copyUrl(file)} className="text-zinc-500 hover:text-zinc-900">
                <Copy className="h-4 w-4" />
              </button>
              <a href={mediaDownloadHref(file)} download className="text-zinc-500 hover:text-zinc-900">
                <Download className="h-4 w-4" />
              </a>
              <button type="button" onClick={() => requestDelete(file)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

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
        title="Delete media file"
        message={
          deleteTarget && (deleteTarget.referenceCount ?? 0) > 0
            ? `This file is currently used in: ${formatUsageSummary(usageData?.data?.usage?.byEntityType ?? {}) || `${deleteTarget.referenceCount ?? 0} place(s)`}. Delete anyway?`
            : `Delete "${deleteTarget?.displayName || deleteTarget?.originalName}"?`
        }
        confirmLabel={(deleteTarget?.referenceCount ?? 0) > 0 ? "Delete anyway" : "Delete"}
        variant="danger"
      />

      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename file" size="sm">
        <input
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && void submitRename()}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setRenameTarget(null)} className="rounded-xl border px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="button" onClick={() => void submitRename()} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Save
          </button>
        </div>
      </Modal>

      <MediaPreviewModal file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
      <MediaDetailsModal
        storeId={storeId}
        file={detailsFile}
        open={!!detailsFile}
        onClose={() => setDetailsFile(null)}
      />
      <MediaLightbox
        files={imageFiles}
        index={lightboxIndex ?? 0}
        open={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        onDelete={(file) => requestDelete(file)}
        onReplace={(file) => {
          setReplaceTarget(file);
          replaceInputRef.current?.click();
        }}
      />
    </div>
  );

  if (pickerMode || !showFolderNav) {
    return mainContent;
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <aside className="w-full shrink-0 lg:w-56">{folderNav}</aside>
      {mainContent}
    </div>
  );
}

function MediaCard({
  file,
  selected,
  onToggle,
  onCopy,
  onPreview,
  onDetails,
  onRename,
  onReplace,
  onDelete,
  onSelect,
}: {
  file: MediaFile;
  selected: boolean;
  onToggle: () => void;
  onCopy: () => void;
  onPreview: () => void;
  onDetails: () => void;
  onRename: () => void;
  onReplace: () => void;
  onDelete: () => void;
  onSelect?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const thumb = mediaThumbnailSrc(file);

  return (
    <div className={`overflow-hidden rounded-xl border ${selected ? "border-zinc-900" : "border-zinc-100"}`}>
      <div className="relative aspect-square bg-zinc-100">
        {isImage(file) && thumb ? (
          <SafeMediaImage
            src={thumb}
            alt={file.displayName || file.originalName}
            className="h-full w-full"
            onClick={onPreview}
          />
        ) : (
          <button
            type="button"
            onClick={onPreview}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center"
          >
            <FileTypeIcon file={file} />
            <span className="line-clamp-2 text-xs font-medium text-zinc-600">
              {file.displayName || file.originalName}
            </span>
          </button>
        )}
        <input type="checkbox" checked={selected} onChange={onToggle} className="absolute left-2 top-2 z-10" />
      </div>
      <div className="space-y-2 p-2">
        <p className="truncate text-xs font-medium">{file.displayName || file.originalName}</p>
        <p className="text-[10px] text-zinc-500">
          {file.width && file.height ? `${file.width}×${file.height}` : fileTypeLabel(file)} · {formatBytes(file.size)}
          {(file.referenceCount ?? 0) > 0 && ` · Used ${file.referenceCount}×`}
        </p>
        <div className="flex flex-wrap gap-1">
          {onSelect && (
            <button type="button" onClick={onSelect} className="flex-1 rounded-lg bg-zinc-900 py-1 text-xs text-white">
              Select
            </button>
          )}
          <ActionBtn icon={Eye} label="Preview" onClick={onPreview} />
          <ActionBtn icon={Copy} label="Copy URL" onClick={onCopy} />
          <a href={mediaDownloadHref(file)} download title="Download" className="rounded-lg border p-1 text-zinc-600 hover:bg-zinc-50">
            <Download className="h-3.5 w-3.5" />
          </a>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg border p-1 text-zinc-600 hover:bg-zinc-50"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                  <MenuItem icon={Pencil} label="Rename" onClick={() => { setMenuOpen(false); onRename(); }} />
                  <MenuItem icon={RefreshCw} label="Replace" onClick={() => { setMenuOpen(false); onReplace(); }} />
                  <MenuItem icon={Info} label="Details" onClick={() => { setMenuOpen(false); onDetails(); }} />
                  <MenuItem icon={Trash2} label="Delete" onClick={() => { setMenuOpen(false); onDelete(); }} danger />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick }: { icon: typeof Eye; label: string; onClick: () => void }) {
  return (
    <button type="button" title={label} onClick={onClick} className="rounded-lg border p-1 text-zinc-600 hover:bg-zinc-50">
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs ${danger ? "text-red-600 hover:bg-red-50" : "text-zinc-700 hover:bg-zinc-50"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
