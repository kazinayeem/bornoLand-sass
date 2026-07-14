import { baseApi } from "@/redux/api/base-api";

export type GlobalSection = {
  _id: string;
  storeId: string;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string;
  type: string;
  category: string;
  sections?: unknown[];
  status: "draft" | "published" | "archived";
  usedOnPages?: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const globalSectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalSections: builder.query<
      ApiEnvelope<{ sections: GlobalSection[] }>,
      string
    >({
      query: (storeId) => ({ url: `/global-sections/stores/${storeId}` }),
      providesTags: (_r, _e, storeId) => [{ type: "GlobalSections", id: storeId }],
    }),

    getGlobalSection: builder.query<
      ApiEnvelope<{ section: GlobalSection }>,
      string
    >({
      query: (id) => ({ url: `/global-sections/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "GlobalSection", id }],
    }),

    createGlobalSection: builder.mutation<
      ApiEnvelope<{ section: GlobalSection }>,
      { storeId: string; name: string; slug: string; description?: string; type?: string; category?: string; sections?: unknown[] }
    >({
      query: ({ storeId, ...body }) => ({ url: `/global-sections/stores/${storeId}`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "GlobalSections", id: storeId }],
    }),

    updateGlobalSection: builder.mutation<
      ApiEnvelope<{ section: GlobalSection }>,
      { id: string; storeId: string; data: Record<string, unknown> }
    >({
      query: ({ id, storeId, data }) => ({ url: `/global-sections/${id}`, method: "PUT", body: { ...data, storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "GlobalSection", id }, { type: "GlobalSections" }],
    }),

    deleteGlobalSection: builder.mutation<
      ApiEnvelope<never>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/global-sections/${id}?storeId=${storeId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "GlobalSections", id: storeId }],
    }),

    publishGlobalSection: builder.mutation<
      ApiEnvelope<{ section: GlobalSection }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/global-sections/${id}/publish`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "GlobalSection", id }, { type: "GlobalSections" }],
    }),

    attachGlobalSectionToPage: builder.mutation<
      ApiEnvelope<never>,
      { id: string; storeId: string; pageId: string }
    >({
      query: ({ id, storeId, pageId }) => ({
        url: `/global-sections/${id}/attach`,
        method: "POST",
        body: { storeId, pageId },
      }),
      invalidatesTags: (_r, _e, { pageId }) => [{ type: "StorePage", id: pageId }],
    }),

    detachGlobalSectionFromPage: builder.mutation<
      ApiEnvelope<never>,
      { id: string; storeId: string; pageId: string }
    >({
      query: ({ id, storeId, pageId }) => ({
        url: `/global-sections/${id}/detach`,
        method: "POST",
        body: { storeId, pageId },
      }),
      invalidatesTags: (_r, _e, { pageId }) => [{ type: "StorePage", id: pageId }],
    }),

    getPagesUsingGlobalSection: builder.query<
      ApiEnvelope<{ pages: Array<{ _id: string; title: string; slug: string; pageType: string; status: string }> }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/global-sections/${id}/pages?storeId=${storeId}` }),
    }),
  }),
});

export const {
  useGetGlobalSectionsQuery,
  useGetGlobalSectionQuery,
  useCreateGlobalSectionMutation,
  useUpdateGlobalSectionMutation,
  useDeleteGlobalSectionMutation,
  usePublishGlobalSectionMutation,
  useAttachGlobalSectionToPageMutation,
  useDetachGlobalSectionFromPageMutation,
  useGetPagesUsingGlobalSectionQuery,
} = globalSectionApi;
