import { baseApi } from "@/redux/api/base-api";

export type BuilderTemplate = {
  _id: string;
  storeId: string;
  tenantId?: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  templateType: "section" | "page" | "header" | "footer" | "global";
  thumbnail?: string;
  sections?: unknown[];
  theme?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  isBuiltIn: boolean;
  isShared: boolean;
  createdBy?: { _id: string; name: string; email: string };
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

export const builderTemplateApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getBuilderTemplates: builder.query<
      ApiEnvelope<{ templates: BuilderTemplate[] }>,
      { storeId: string; category?: string; templateType?: string }
    >({
      query: ({ storeId, category, templateType }) => {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (templateType) params.set("templateType", templateType);
        const qs = params.toString();
        return { url: `/builder-templates/stores/${storeId}${qs ? `?${qs}` : ""}` };
      },
      providesTags: (_r, _e, { storeId }) => [{ type: "BuilderTemplates", id: storeId }],
    }),

    getBuilderTemplate: builder.query<
      ApiEnvelope<{ template: BuilderTemplate }>,
      string
    >({
      query: (id) => ({ url: `/builder-templates/${id}` }),
      providesTags: (_r, _e, id) => [{ type: "BuilderTemplate", id }],
    }),

    createBuilderTemplate: builder.mutation<
      ApiEnvelope<{ template: BuilderTemplate }>,
      {
        storeId: string; name: string; description?: string; category?: string;
        templateType?: string; sections?: unknown[]; thumbnail?: string;
      }
    >({
      query: ({ storeId, ...body }) => ({ url: `/builder-templates/stores/${storeId}`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "BuilderTemplates", id: storeId }],
    }),

    createTemplateFromPage: builder.mutation<
      ApiEnvelope<{ template: BuilderTemplate }>,
      { storeId: string; pageId: string; name: string; description?: string; category?: string; thumbnail?: string }
    >({
      query: ({ storeId, pageId, ...body }) => ({
        url: `/builder-templates/from-page/${pageId}`,
        method: "POST",
        body: { ...body, storeId },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "BuilderTemplates", id: storeId }],
    }),

    updateBuilderTemplate: builder.mutation<
      ApiEnvelope<{ template: BuilderTemplate }>,
      { id: string; storeId: string; data: Record<string, unknown> }
    >({
      query: ({ id, storeId, data }) => ({ url: `/builder-templates/${id}`, method: "PUT", body: { ...data, storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "BuilderTemplate", id }, { type: "BuilderTemplates" }],
    }),

    deleteBuilderTemplate: builder.mutation<
      ApiEnvelope<never>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/builder-templates/${id}?storeId=${storeId}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "BuilderTemplates", id: storeId }],
    }),

    publishTemplate: builder.mutation<
      ApiEnvelope<{ template: BuilderTemplate }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/builder-templates/${id}/publish`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "BuilderTemplate", id }, { type: "BuilderTemplates" }],
    }),

    duplicateTemplate: builder.mutation<
      ApiEnvelope<{ template: BuilderTemplate }>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/builder-templates/${id}/duplicate`, method: "POST", body: { storeId } }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "BuilderTemplates", id: storeId }],
    }),

    exportTemplate: builder.query<
      ApiEnvelope<Record<string, unknown>>,
      { id: string; storeId: string }
    >({
      query: ({ id, storeId }) => ({ url: `/builder-templates/${id}/export?storeId=${storeId}` }),
    }),

    seedBuiltInTemplates: builder.mutation<
      ApiEnvelope<{ created: number }>,
      string
    >({
      query: (storeId) => ({ url: `/builder-templates/stores/${storeId}/seed`, method: "POST" }),
      invalidatesTags: (_r, _e, storeId) => [{ type: "BuilderTemplates", id: storeId }],
    }),

    importTemplate: builder.mutation<
      ApiEnvelope<{ template: BuilderTemplate }>,
      {
        storeId: string; name: string; description?: string; category?: string;
        templateType?: string; sections?: unknown[]; theme?: Record<string, unknown>;
        seo?: Record<string, unknown>; settings?: Record<string, unknown>;
      }
    >({
      query: ({ storeId, ...body }) => ({ url: `/builder-templates/stores/${storeId}/import`, method: "POST", body }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "BuilderTemplates", id: storeId }],
    }),
  }),
});

export const {
  useGetBuilderTemplatesQuery,
  useGetBuilderTemplateQuery,
  useCreateBuilderTemplateMutation,
  useCreateTemplateFromPageMutation,
  useUpdateBuilderTemplateMutation,
  useDeleteBuilderTemplateMutation,
  usePublishTemplateMutation,
  useDuplicateTemplateMutation,
  useExportTemplateQuery,
  useImportTemplateMutation,
  useSeedBuiltInTemplatesMutation,
} = builderTemplateApi;
