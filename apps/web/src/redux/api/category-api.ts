import { baseApi } from "@/redux/api/base-api";
import type { ListQueryParams, PaginationMeta } from "@/types/pagination";

export type Category = {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  imageUrl: string;
  imageId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  iconUrl?: string;
  iconId?: string | null;
  description: string;
  parentId: string | null;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  productCount?: number;
  subcategoryCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};


type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type CategoriesResponse = {
  categories: Category[];
  pagination?: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};
type CategoryResponse = { category: Category };

type CreateCategoryPayload = {
  name: string;
  slug: string;
  imageUrl?: string;
  imageId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  iconUrl?: string;
  iconId?: string | null;
  description?: string;
  parentId?: string | null;
  active?: boolean;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
};

type UpdateCategoryPayload = {
  name?: string;
  slug?: string;
  imageUrl?: string;
  imageId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  iconUrl?: string;
  iconId?: string | null;
  description?: string;
  parentId?: string | null;
  active?: boolean;
  featured?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiEnvelope<CategoriesResponse>, string | ({ storeId: string } & ListQueryParams)>({
      query: (arg) => {
        if (typeof arg === "string") {
          return { url: `/categories/${arg}`, params: { page: 1, limit: 100 } };
        }
        const { storeId, ...params } = arg;
        return { url: `/categories/${storeId}`, params };
      },
      providesTags: (_result, _error, arg) => [{ type: "Categories", id: typeof arg === "string" ? arg : arg.storeId }],
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
