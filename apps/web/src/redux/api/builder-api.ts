import { baseApi } from "./base-api";

export type PageData = {
  _id: string;
  storeId: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  sections: any[];
  theme: Record<string, unknown>;
  seo: { title: string; description: string };
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type PagesResponse = ApiEnvelope<{ pages: PageData[] }>;
type PageResponse = ApiEnvelope<{ page: PageData }>;

type SavePayload = {
  sections?: unknown[];
  theme?: Record<string, unknown>;
};

type CreatePagePayload = {
  title: string;
  slug: string;
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
    savePage: builder.mutation<PageResponse, { pageId: string; data: SavePayload }>({
      query: ({ pageId, data }) => ({ url: `/builder/page/${pageId}/save`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { pageId }) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    publishPage: builder.mutation<PageResponse, string>({
      query: (pageId) => ({ url: `/builder/page/${pageId}/publish`, method: "POST" }),
      invalidatesTags: (_result, _error, pageId) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
    createPage: builder.mutation<PageResponse, { storeId: string; data: CreatePagePayload }>({
      query: ({ storeId, data }) => ({ url: `/builder/${storeId}/pages/create`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "BuilderPages" as const, id: storeId }],
    }),
    deletePage: builder.mutation<{ success: boolean; message: string }, string>({
      query: (pageId) => ({ url: `/builder/page/${pageId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, pageId) => [{ type: "BuilderPage" as const, id: pageId }],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageQuery,
  useSavePageMutation,
  usePublishPageMutation,
  useCreatePageMutation,
  useDeletePageMutation,
} = builderApi;
