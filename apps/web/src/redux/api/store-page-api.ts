import { baseApi } from "@/redux/api/base-api";

export type StorePageSeo = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
};

export type StorePageSettings = {
  customCss?: string;
  customJs?: string;
  password?: string;
  passwordProtect?: boolean;
  redirectUrl?: string;
  redirectType?: "301" | "302" | "none";
  showHeader?: boolean;
  showFooter?: boolean;
  transparentHeader?: boolean;
  stickyHeader?: boolean;
  layoutWidth?: string;
  layoutStyle?: "default" | "full-width" | "sidebar" | "landing";
};

export type StorePageTheme = {
  primaryColor?: string;
  secondaryColor?: string;
  font?: string;
  buttonStyle?: string;
  darkMode?: boolean;
  navbarStyle?: string;
};

export type StorePage = {
  _id: string;
  storeId: string;
  tenantId?: string;
  authorId?: { _id: string; name: string; email: string };
  title: string;
  slug: string;
  description?: string;
  pageIcon?: string;
  featuredImage?: string;
  status: "draft" | "published" | "scheduled" | "archived";
  visibility: "visible" | "hidden" | "password";
  isHomePage: boolean;
  sortOrder: number;
  sections?: unknown[];
  html?: string;
  theme?: StorePageTheme;
  seo?: StorePageSeo;
  settings?: StorePageSettings;
  publishedAt?: string;
  scheduledAt?: string;
  archivedAt?: string;
  deletedAt?: string | null;
  deletedBy?: { _id: string; name: string; email: string } | null;
  previewToken?: string;
  previewTokenExpiresAt?: string;
  parentId?: string | null;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
  children?: StorePage[];
};

export type PageVersion = {
  _id: string;
  pageId: string;
  storeId: string;
  version: number;
  title: string;
  slug: string;
  sections?: unknown[];
  html?: string;
  theme?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  status: string;
  createdBy?: { _id: string; name: string; email: string };
  note?: string;
  createdAt: string;
};

export type PageHistory = {
  _id: string;
  pageId?: string;
  storeId: string;
  userId?: { _id: string; name: string; email: string };
  action: string;
  title?: string;
  slug?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const storePageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Pages CRUD ──────────────────────────────────────────────────────────
    getStorePages: builder.query<
      ApiEnvelope<{ pages: StorePage[]; tree: StorePage[] }>,
      string
    >({
      query: (storeId) => ({ url: `/store-pages/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "StorePages", id: storeId }],
    }),

    searchStorePages: builder.query<
      ApiEnvelope<{ pages: StorePage[] }>,
      { storeId: string; q: string }
    >({
      query: ({ storeId, q }) => ({ url: `/store-pages/stores/${storeId}/search?q=${encodeURIComponent(q)}` }),
      providesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    getStorePage: builder.query<ApiEnvelope<{ page: StorePage }>, string>({
      query: (id) => ({ url: `/store-pages/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "StorePage", id }],
    }),

    createStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { storeId: string; title: string; slug: string; description?: string; parentId?: string; isFolder?: boolean }
    >({
      query: ({ storeId, ...body }) => ({ url: `/store-pages/stores/${storeId}`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    updateStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string; data: Record<string, unknown> }
    >({
      query: ({ id, storeId, data }) => ({ url: `/store-pages/${id}`, method: "PUT", body: { ...data, storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StorePage", id }, { type: "StorePages" }],
    }),

    deleteStorePage: builder.mutation<
      ApiEnvelope<never>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/store-pages/${id}?storeId=${storeId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    // ─── Actions ─────────────────────────────────────────────────────────────
    duplicateStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/store-pages/${id}/duplicate`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    publishStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/store-pages/${id}/publish`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StorePage", id }, { type: "StorePages" }],
    }),

    unpublishStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/store-pages/${id}/unpublish`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StorePage", id }, { type: "StorePages" }],
    }),

    scheduleStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string; scheduledAt: string }
    >({
      query: ({ id, storeId, scheduledAt }) => ({ url: `/store-pages/${id}/schedule`, method: "POST", body: { storeId, scheduledAt } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StorePage", id }, { type: "StorePages" }],
    }),

    archiveStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/store-pages/${id}/archive`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    restoreStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/store-pages/${id}/restore`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    renameStorePage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string; title: string }
    >({
      query: ({ id, storeId, title }) => ({ url: `/store-pages/${id}/rename`, method: "PATCH", body: { storeId, title } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StorePage", id }, { type: "StorePages" }],
    }),

    saveStorePageDraft: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string; sections?: unknown[]; theme?: Record<string, unknown>; settings?: Record<string, unknown>; html?: string }
    >({
      query: ({ id, storeId, ...data }) => ({ url: `/store-pages/${id}/draft`, method: "PUT", body: { storeId, ...data } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "StorePage", id }],
    }),

    reorderStorePages: builder.mutation<
      ApiEnvelope<never>,
      { storeId: string; orderedIds: string[] }
    >({
      query: ({ storeId, orderedIds }) => ({ url: `/store-pages/stores/${storeId}/reorder`, method: "PUT", body: { orderedIds } }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }],
    }),

    // ─── Versions ────────────────────────────────────────────────────────────
    getPageVersions: builder.query<ApiEnvelope<{ versions: PageVersion[] }>, string>({
      query: (pageId) => ({ url: `/store-pages/${pageId}/versions` }),
      providesTags: (_r, _e, pageId) => [{ type: "PageVersions", id: pageId }],
    }),

    getPageVersion: builder.query<ApiEnvelope<{ version: PageVersion }>, string>({
      query: (versionId) => ({ url: `/store-pages/versions/${versionId}` }),
    }),

    restorePageVersion: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { pageId: string; versionId: string; storeId: string }
    >({
      query: ({ pageId, versionId, storeId }) => ({
        url: `/store-pages/${pageId}/versions/${versionId}/restore`,
        method: "POST",
        body: { storeId },
      }),
      invalidatesTags: (_r, _e, { pageId }) => [{ type: "StorePage", id: pageId }, { type: "PageVersions", id: pageId }],
    }),

    // ─── History ──────────────────────────────────────────────────────────────
    getPageHistory: builder.query<
      ApiEnvelope<{ history: PageHistory[] }>,
      { pageId: string; storeId: string }
    >({
      query: ({ pageId, storeId }) => ({ url: `/store-pages/${pageId}/history?storeId=${storeId}` }),
    }),

    getStorePageHistory: builder.query<
      ApiEnvelope<{ history: PageHistory[] }>,
      string
    >({
      query: (storeId) => ({ url: `/store-pages/stores/${storeId}/history` }),
    }),

    // ─── Preview ────────────────────────────────────────────────────────────
    generatePreviewToken: builder.mutation<
      ApiEnvelope<{ token: string; expiresAt: string; previewUrl: string }>,
      { pageId: string; storeId: string }
    >({
      query: ({ pageId, storeId }) => ({
        url: `/store-pages/${pageId}/preview-token`,
        method: "POST",
        body: { storeId },
      }),
    }),

    // ─── Export / Import ────────────────────────────────────────────────────
    exportPageSections: builder.query<
      ApiEnvelope<{ version: string; exportedAt: string; sourcePage: string; sourceSlug: string; sections: unknown[]; theme?: Record<string, unknown>; seo?: Record<string, unknown>; settings?: Record<string, unknown> }>,
      { pageId: string; storeId: string }
    >({
      query: ({ pageId, storeId }) => ({ url: `/store-pages/${pageId}/export?storeId=${storeId}` }),
    }),

    importPageSections: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { pageId: string; storeId: string; sections?: unknown[]; theme?: Record<string, unknown>; settings?: Record<string, unknown> }
    >({
      query: ({ pageId, storeId, ...data }) => ({
        url: `/store-pages/${pageId}/import`,
        method: "POST",
        body: { storeId, ...data },
      }),
      invalidatesTags: (_r, _e, { pageId }) => [{ type: "StorePage", id: pageId }],
    }),

    // ─── Deleted pages (trash) ──────────────────────────────────────────────
    getDeletedStorePages: builder.query<
      ApiEnvelope<{ pages: StorePage[] }>,
      string
    >({
      query: (storeId) => ({ url: `/store-pages/stores/${storeId}/deleted` }),
      providesTags: (_r, _e, storeId) => [{ type: "StorePages", id: `trash-${storeId}` }],
    }),

    restoreSoftDeletedPage: builder.mutation<
      ApiEnvelope<{ page: StorePage }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({
        url: `/store-pages/${id}/restore-deleted`,
        method: "POST",
        body: { storeId },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StorePages", id: storeId }, { type: "StorePages", id: `trash-${storeId}` }],
    }),
  }),
});

export const {
  useGetStorePagesQuery,
  useSearchStorePagesQuery,
  useGetStorePageQuery,
  useCreateStorePageMutation,
  useUpdateStorePageMutation,
  useDeleteStorePageMutation,
  useDuplicateStorePageMutation,
  usePublishStorePageMutation,
  useUnpublishStorePageMutation,
  useScheduleStorePageMutation,
  useArchiveStorePageMutation,
  useRestoreStorePageMutation,
  useRenameStorePageMutation,
  useSaveStorePageDraftMutation,
  useReorderStorePagesMutation,
  useGetPageVersionsQuery,
  useGetPageVersionQuery,
  useRestorePageVersionMutation,
  useGetPageHistoryQuery,
  useGetStorePageHistoryQuery,
  useGeneratePreviewTokenMutation,
  useExportPageSectionsQuery,
  useImportPageSectionsMutation,
  useGetDeletedStorePagesQuery,
  useRestoreSoftDeletedPageMutation,
} = storePageApi;
