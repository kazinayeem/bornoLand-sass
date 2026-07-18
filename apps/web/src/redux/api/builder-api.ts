import { baseApi } from "./base-api";

export type PageData = {
  _id: string;
  storeId: string;
  title: string;
  slug: string;
  pageType?: string;
  isHome: boolean;
  showHeader: boolean;
  showFooter: boolean;
  navigationVisible: boolean;
  status: "draft" | "published" | "archived";
  featuredImage: string;
  password: string;
  customCss: string;
  customJs: string;
  sections: any[];
  headerSections?: any[];
  footerSections?: any[];
  headerSettings?: Record<string, unknown>;
  footerSettings?: Record<string, unknown>;
  theme: Record<string, unknown>;
  seo: { title: string; description: string };
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type PagesResponse = ApiEnvelope<{ pages: PageData[] }>;
type PageResponse = ApiEnvelope<{ page: PageData }>;

type SavePayload = {
  storeId: string;
  sections?: unknown[];
  headerSections?: unknown[];
  footerSections?: unknown[];
  headerSettings?: Record<string, unknown>;
  footerSettings?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type PublishPayload = {
  storeId: string;
  status?: "draft" | "published";
};

type CreatePagePayload = {
  title: string;
  slug: string;
  templateId?: string;
};

type UpdatePagePayload = {
  storeId: string;
  title?: string;
  slug?: string;
  seo?: { title?: string; description?: string };
  showHeader?: boolean;
  showFooter?: boolean;
  navigationVisible?: boolean;
  featuredImage?: string;
  password?: string;
  customCss?: string;
  customJs?: string;
};

export const builderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPages: builder.query<PagesResponse, string>({
      query: (storeId) => ({ url: `/builder/${storeId}/pages` }),
      providesTags: (result, _error, storeId) =>
        result?.data?.pages
          ? [...result.data.pages.map(({ _id }) => ({ type: "BuilderPage" as const, id: _id })), { type: "BuilderPages" as const, id: storeId }]
          : [{ type: "BuilderPages" as const, id: storeId }],
    }),
    getPage: builder.query<PageResponse, string>({
      query: (pageId) => ({ url: `/builder/page/${pageId}` }),
      providesTags: (_result, _error, pageId) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    getHomePage: builder.query<PageResponse, string>({
      query: (storeId) => ({ url: `/builder/${storeId}/home` }),
      providesTags: (_result, _error, storeId) => [{ type: "BuilderPage" as const, id: `${storeId}-home` }],
    }),
    savePage: builder.mutation<PageResponse, { storeId: string; pageId: string; data: Omit<SavePayload, "storeId"> }>({
      query: ({ pageId, storeId, data }) => ({
        url: `/builder/page/${pageId}/save`,
        method: "PUT",
        body: { ...data, storeId },
      }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    updatePage: builder.mutation<PageResponse, { pageId: string; data: UpdatePagePayload }>({
      query: ({ pageId, data }) => ({
        url: `/builder/page/${pageId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    publishPage: builder.mutation<PageResponse, { storeId: string; pageId: string; status?: PublishPayload["status"] }>({
      query: ({ pageId, storeId, status }) => ({
        url: `/builder/page/${pageId}/publish`,
        method: "POST",
        body: { storeId, status: status ?? "published" },
      }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    createPage: builder.mutation<PageResponse, { storeId: string; data: CreatePagePayload }>({
      query: ({ storeId, data }) => ({ url: `/builder/${storeId}/pages/create`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "BuilderPages" as const, id: storeId }],
    }),
    duplicatePage: builder.mutation<PageResponse, { storeId: string; pageId: string }>({
      query: ({ pageId, storeId }) => ({ url: `/builder/page/${pageId}/duplicate`, method: "POST", body: { storeId } }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "BuilderPages" as const, id: storeId }],
    }),
    renamePage: builder.mutation<PageResponse, { pageId: string; title: string }>({
      query: ({ pageId, title }) => ({ url: `/builder/page/${pageId}/rename`, method: "PATCH", body: { title } }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    archivePage: builder.mutation<PageResponse, { storeId: string; pageId: string }>({
      query: ({ pageId, storeId }) => ({ url: `/builder/page/${pageId}/archive`, method: "POST", body: { storeId } }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    restorePage: builder.mutation<PageResponse, { storeId: string; pageId: string }>({
      query: ({ pageId, storeId }) => ({ url: `/builder/page/${pageId}/restore`, method: "POST", body: { storeId } }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    resetPage: builder.mutation<PageResponse, { storeId: string; pageId: string }>({
      query: ({ pageId, storeId }) => ({ url: `/builder/page/${pageId}/reset`, method: "POST", body: { storeId } }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    deletePage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (pageId) => ({ url: `/builder/page/${pageId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, pageId) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    clearPage: builder.mutation<PageResponse, { storeId: string; pageId: string }>({
      query: ({ pageId, storeId }) => ({
        url: `/builder/page/${pageId}/clear`,
        method: "POST",
        body: { storeId },
      }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageQuery,
  useGetHomePageQuery,
  useSavePageMutation,
  useUpdatePageMutation,
  usePublishPageMutation,
  useCreatePageMutation,
  useDuplicatePageMutation,
  useRenamePageMutation,
  useArchivePageMutation,
  useRestorePageMutation,
  useResetPageMutation,
  useDeletePageMutation,
  useClearPageMutation,
} = builderApi;
