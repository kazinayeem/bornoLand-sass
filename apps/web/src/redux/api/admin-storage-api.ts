import { baseApi } from "@/redux/api/base-api";

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export type PlatformStorageAnalytics = {
  totalStores: number;
  totalUsedBytes: number;
  totalLimitBytes: number;
  totalFreeBytes: number;
  totalFiles: number;
  totalUsedGB: number;
};

export type AdminStoreStorageRow = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  usedBytes: number;
  limitBytes: number;
  percentUsed: number;
  fileCount: number;
  unlimited: boolean;
  uploadsSuspended?: boolean;
  plan?: { name: string; slug?: string };
  owner?: { name?: string; email?: string };
};

export type StoragePlanSettings = {
  planId: string;
  storageLimitMB: number;
  maxFileSizeMB: number;
  allowedMimeTypes: string[];
  maxUploads: number;
  maxImages: number;
  maxDocuments: number;
  unlimited: boolean;
};

export const adminStorageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStorageAnalytics: builder.query<ApiEnvelope<{ analytics: PlatformStorageAnalytics }>, void>({
      query: () => ({ url: "/admin/storage/analytics" }),
      providesTags: ["Media"],
    }),
    getAdminStoreStorageList: builder.query<ApiEnvelope<{ stores: AdminStoreStorageRow[] }>, void>({
      query: () => ({ url: "/admin/storage/stores" }),
      providesTags: ["Media"],
    }),
    updateStoreStorage: builder.mutation<
      ApiEnvelope<{ stats: Record<string, unknown> }>,
      { storeId: string; limitMB?: number; unlimited?: boolean; uploadsSuspended?: boolean; resetUsage?: boolean }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/admin/storage/stores/${storeId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Media"],
    }),
    updatePlanStorage: builder.mutation<
      ApiEnvelope<{ plan: StoragePlanSettings }>,
      { planId: string; data: Partial<StoragePlanSettings> }
    >({
      query: ({ planId, data }) => ({
        url: `/admin/storage/plans/${planId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Media", "Stores"],
    }),
    cleanupStoreStorage: builder.mutation<ApiEnvelope<{ cleaned: number }>, string>({
      query: (storeId) => ({
        url: `/admin/storage/stores/${storeId}/cleanup`,
        method: "POST",
      }),
      invalidatesTags: ["Media"],
    }),
    recalculateAllStorageLimits: builder.mutation<ApiEnvelope<{ processed: number; failed: number }>, void>({
      query: () => ({
        url: "/admin/storage/recalculate",
        method: "POST",
      }),
      invalidatesTags: ["Media", "Stores"],
    }),
  }),
});

export const {
  useGetPlatformStorageAnalyticsQuery,
  useGetAdminStoreStorageListQuery,
  useUpdateStoreStorageMutation,
  useUpdatePlanStorageMutation,
  useCleanupStoreStorageMutation,
  useRecalculateAllStorageLimitsMutation,
} = adminStorageApi;
