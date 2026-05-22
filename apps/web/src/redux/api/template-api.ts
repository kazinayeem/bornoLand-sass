import { baseApi } from "@/redux/api/base-api";

export type Template = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  status: "draft" | "published";
  preview: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    font: string;
    buttonStyle: string;
    layoutWidth: string;
    darkMode: boolean;
    navbarStyle: string;
  };
  sections: Record<string, unknown>[];
  createdAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

export const templateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<ApiEnvelope<{ templates: Template[] }>, void>({
      query: () => ({ url: "/templates" }),
      providesTags: ["Templates"]
    }),
    getAdminTemplates: builder.query<ApiEnvelope<{ templates: Template[] }>, void>({
      query: () => ({ url: "/templates/admin" }),
      providesTags: ["Templates"]
    }),
    getTemplate: builder.query<ApiEnvelope<{ template: Template }>, string>({
      query: (id) => ({ url: `/templates/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Templates", id }]
    }),
    createTemplate: builder.mutation<ApiEnvelope<{ template: Template }>, Partial<Template>>({
      query: (body) => ({ url: "/templates/create", method: "POST", body }),
      invalidatesTags: ["Templates"]
    }),
    updateTemplate: builder.mutation<ApiEnvelope<{ template: Template }>, { id: string; data: Partial<Template> }>({
      query: ({ id, data }) => ({ url: `/templates/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => ["Templates", { type: "Templates", id }]
    }),
    deleteTemplate: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/templates/${id}`, method: "DELETE" }),
      invalidatesTags: ["Templates"]
    }),
    applyTemplate: builder.mutation<ApiEnvelope<never>, { storeId: string; templateId: string }>({
      query: (body) => ({ url: "/templates/apply", method: "POST", body }),
      invalidatesTags: ["Stores"]
    })
  })
});

export const {
  useGetTemplatesQuery,
  useGetAdminTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useApplyTemplateMutation
} = templateApi;
