export type MediaFile = {
  _id: string;
  storeId: string;
  folder: string;
  originalName: string;
  displayName: string;
  fileType: "image" | "document" | "video" | "audio" | "other";
  mimeType: string;
  extension: string;
  size: number;
  width: number;
  height: number;
  publicUrl: string;
  thumbnailUrl: string;
  previewUrl?: string;
  downloadUrl?: string;
  storagePath?: string;
  tags: string[];
  createdAt: string;
  referenceCount?: number;
};

export type MediaUsageSummary = {
  total: number;
  byEntityType: Record<string, number>;
  references: Array<{ entityType: string; entityId: string; fieldPath: string; label: string }>;
};

export type StorageStats = {
  usedBytes: number;
  limitBytes: number;
  availableBytes: number;
  percentUsed: number;
  fileCount: number;
  imageCount: number;
  documentCount: number;
  videoCount: number;
  unlimited: boolean;
  uploadsSuspended: boolean;
  usedMB: number;
  limitMB: number;
  limitGB: number;
};

export type MediaListData = {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
  stats: StorageStats;
  globalStats?: StorageStats;
};

export type MediaFilter = "all" | "image" | "video" | "document" | "pdf" | "svg" | "audio" | "archive" | "other" | "unused" | "used";
export type MediaSort = "newest" | "oldest" | "largest" | "smallest" | "name-asc" | "name-desc";

export type LocalUploadAsset = {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
};

export type UploadStatus = "waiting" | "uploading" | "done" | "error" | "cancelled";

export type UploadItem = LocalUploadAsset & {
  id: string;
  progress: number;
  status: UploadStatus;
  bytesLoaded: number;
  bytesTotal: number;
  speed: number;
  eta: number | null;
  error?: string;
  result?: MediaFile;
};
