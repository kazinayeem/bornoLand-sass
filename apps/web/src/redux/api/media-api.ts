import { baseApi } from "@/redux/api/base-api";

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
  references: Array<{
    entityType: string;
    entityId: string;
    fieldPath: string;
    label: string;
  }>;
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

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMediaFiles: builder.query<
      ApiEnvelope<{
        files: MediaFile[];
        total: number;
        page: number;
        limit: number;
        stats: StorageStats;
        globalStats?: StorageStats;
      }>,
      {
        storeId: string;
        search?: string;
        folder?: string;
        fileType?: string;
        usage?: string;
        mimeType?: string;
        sort?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ storeId, ...params }) => ({ url: `/stores/${storeId}/media`, params }),
      providesTags: (_r, _e, { storeId }) => [
        { type: "Media", id: storeId },
        { type: "Media", id: `stats-${storeId}` },
      ],
    }),
    getMediaFile: builder.query<
      ApiEnvelope<{ file: MediaFile; usage: MediaUsageSummary }>,
      { storeId: string; id: string }
    >({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/media/${id}` }),
    }),
    getMediaStats: builder.query<ApiEnvelope<{ stats: StorageStats }>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/media/stats` }),
      providesTags: (_r, _e, storeId) => [{ type: "Media", id: `stats-${storeId}` }],
    }),
    getMediaUsage: builder.query<
      ApiEnvelope<{ file: MediaFile; usage: MediaUsageSummary }>,
      { storeId: string; id: string }
    >({
      query: ({ storeId, id }) => ({ url: `/stores/${storeId}/media/${id}/usage` }),
    }),
    replaceMediaFile: builder.mutation<
      ApiEnvelope<{ updated: number; newPublicUrl: string }>,
      { storeId: string; id: string; newMediaFileId: string }
    >({
      query: ({ storeId, id, newMediaFileId }) => ({
        url: `/stores/${storeId}/media/${id}/replace`,
        method: "POST",
        body: { newMediaFileId },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Media", id: storeId },
        { type: "Media", id: `stats-${storeId}` },
      ],
    }),
    renameMediaFile: builder.mutation<ApiEnvelope<{ file: MediaFile }>, { storeId: string; id: string; displayName: string }>({
      query: ({ storeId, id, displayName }) => ({
        url: `/stores/${storeId}/media/${id}`,
        method: "PUT",
        body: { displayName },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Media", id: storeId }],
    }),
    deleteMediaFile: builder.mutation<
      ApiEnvelope<{ stats: StorageStats }>,
      { storeId: string; id: string; force?: boolean }
    >({
      query: ({ storeId, id, force }) => ({
        url: `/stores/${storeId}/media/${id}${force ? "?force=true" : ""}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Media", id: storeId }, { type: "Media", id: `stats-${storeId}` }],
    }),
    bulkDeleteMedia: builder.mutation<
      ApiEnvelope<{ deleted: number; failed: number }>,
      { storeId: string; fileIds: string[]; force?: boolean }
    >({
      query: ({ storeId, fileIds, force }) => ({
        url: `/stores/${storeId}/media/bulk-delete`,
        method: "POST",
        body: { fileIds, force },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Media", id: storeId },
        { type: "Media", id: `stats-${storeId}` },
      ],
    }),
    importMediaFromUrl: builder.mutation<
      ApiEnvelope<{ file: MediaFile }>,
      { storeId: string; url: string; folder?: string; displayName?: string }
    >({
      query: ({ storeId, url, folder, displayName }) => ({
        url: `/stores/${storeId}/media/import-url`,
        method: "POST",
        body: { url, folder, displayName },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [
        { type: "Media", id: storeId },
        { type: "Media", id: `stats-${storeId}` },
      ],
    }),
  }),
});

export const {
  useGetMediaFilesQuery,
  useGetMediaFileQuery,
  useGetMediaStatsQuery,
  useGetMediaUsageQuery,
  useReplaceMediaFileMutation,
  useRenameMediaFileMutation,
  useDeleteMediaFileMutation,
  useBulkDeleteMediaMutation,
  useImportMediaFromUrlMutation,
} = mediaApi;

export function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}
