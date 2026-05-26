import { baseApi } from "@/redux/api/base-api";

export type CmsPage = {
  _id: string;
  storeId: string;
  slug: string;
  title: string;
  content?: unknown[];
  html: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  published: boolean;
  layout: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FaqItem = {
  _id: string;
  storeId: string;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type CmsPagesResponse = { pages: CmsPage[] };
type CmsPageResponse = { page: CmsPage };
type FaqsResponse = { faqs: FaqItem[] };
type FaqResponse = { faq: FaqItem };

type SavePagePayload = {
  title?: string;
  html?: string;
  content?: unknown[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  published?: boolean;
  layout?: string;
};

type CreateFaqPayload = {
  question: string;
  answer: string;
  category?: string;
};

type UpdateFaqPayload = {
  question?: string;
  answer?: string;
  sortOrder?: number;
  active?: boolean;
  category?: string;
};

export const cmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCmsPages: builder.query<ApiEnvelope<CmsPagesResponse>, string>({
      query: (storeId) => ({ url: `/cms/${storeId}/pages` }),
      providesTags: (_result, _error, storeId) => [{ type: "CmsPages", id: storeId }],
    }),
    getCmsPage: builder.query<ApiEnvelope<CmsPageResponse>, { storeId: string; slug: string }>({
      query: ({ storeId, slug }) => ({ url: `/cms/${storeId}/pages/${slug}` }),
      providesTags: (_result, _error, { storeId, slug }) => [{ type: "CmsPage", id: `${storeId}:${slug}` }],
    }),
    saveCmsPage: builder.mutation<ApiEnvelope<CmsPageResponse>, { storeId: string; slug: string; data: SavePagePayload }>({
      query: ({ storeId, slug, data }) => ({ url: `/cms/${storeId}/pages/${slug}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId, slug }) => [{ type: "CmsPage", id: `${storeId}:${slug}` }, { type: "CmsPages", id: storeId }],
    }),
    getFaqs: builder.query<ApiEnvelope<FaqsResponse>, string>({
      query: (storeId) => ({ url: `/cms/${storeId}/faqs` }),
      providesTags: (_result, _error, storeId) => [{ type: "Faqs", id: storeId }],
    }),
    createFaq: builder.mutation<ApiEnvelope<FaqResponse>, { storeId: string; data: CreateFaqPayload }>({
      query: ({ storeId, data }) => ({ url: `/cms/${storeId}/faqs/create`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Faqs", id: storeId }],
    }),
    updateFaq: builder.mutation<ApiEnvelope<FaqResponse>, { storeId: string; faqId: string; data: UpdateFaqPayload }>({
      query: ({ storeId, faqId, data }) => ({ url: `/cms/${storeId}/faqs/${faqId}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Faqs", id: storeId }],
    }),
    deleteFaq: builder.mutation<ApiEnvelope<never>, { storeId: string; faqId: string }>({
      query: ({ storeId, faqId }) => ({ url: `/cms/${storeId}/faqs/${faqId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Faqs", id: storeId }],
    }),
    reorderFaqs: builder.mutation<ApiEnvelope<never>, { storeId: string; orderedIds: string[] }>({
      query: ({ storeId, orderedIds }) => ({ url: `/cms/${storeId}/faqs/reorder`, method: "PUT", body: { orderedIds } }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Faqs", id: storeId }],
    }),
  }),
});

export const {
  useGetCmsPagesQuery,
  useGetCmsPageQuery,
  useSaveCmsPageMutation,
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useReorderFaqsMutation,
} = cmsApi;
