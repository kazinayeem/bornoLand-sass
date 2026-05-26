import { baseApi } from "@/redux/api/base-api";

export type Category = {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  parentId: string | null;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type CategoriesResponse = { categories: Category[] };
type CategoryResponse = { category: Category };

type CreateCategoryPayload = {
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
  active?: boolean;
  featured?: boolean;
};

type UpdateCategoryPayload = {
  name?: string;
  slug?: string;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
  active?: boolean;
  featured?: boolean;
  sortOrder?: number;
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiEnvelope<CategoriesResponse>, string>({
      query: (storeId) => ({ url: `/categories/${storeId}` }),
      providesTags: (_result, _error, storeId) => [{ type: "Categories", id: storeId }],
    }),
    getCategory: builder.query<ApiEnvelope<CategoryResponse>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/categories/${storeId}/${id}` }),
      providesTags: (_result, _error, { id }) => [{ type: "Categories", id }],
    }),
    createCategory: builder.mutation<ApiEnvelope<CategoryResponse>, { storeId: string; data: CreateCategoryPayload }>({
      query: ({ storeId, data }) => ({ url: `/categories/${storeId}/create`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Categories", id: storeId }],
    }),
    updateCategory: builder.mutation<ApiEnvelope<CategoryResponse>, { storeId: string; id: string; data: UpdateCategoryPayload }>({
      query: ({ storeId, id, data }) => ({ url: `/categories/${storeId}/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Categories", id: storeId }],
    }),
    deleteCategory: builder.mutation<ApiEnvelope<never>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/categories/${storeId}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Categories", id: storeId }],
    }),
    reorderCategories: builder.mutation<ApiEnvelope<never>, { storeId: string; orderedIds: string[] }>({
      query: ({ storeId, orderedIds }) => ({ url: `/categories/${storeId}/reorder`, method: "PUT", body: { orderedIds } }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Categories", id: storeId }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
} = categoryApi;
