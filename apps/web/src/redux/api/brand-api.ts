import { baseApi } from "@/redux/api/base-api";
import type { ListQueryParams, PaginationMeta } from "@/types/pagination";

export type Brand = {
  _id: string;
  storeId: string;
  name: string;
  nameEn?: string;
  nameBn?: string;
  slug: string;
  description: string;
  descriptionEn?: string;
  descriptionBn?: string;
  logoUrl: string;
  logoId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  website: string;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  productCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type BrandsResponse = {
  brands: Brand[];
  pagination?: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};
type BrandResponse = { brand: Brand };

type CreateBrandPayload = {
  name: string;
  nameEn?: string;
  nameBn?: string;
  slug: string;
  description?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  logoUrl?: string;
  logoId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  website?: string;
  active?: boolean;
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
};

type UpdateBrandPayload = {
  name?: string;
  nameEn?: string;
  nameBn?: string;
  slug?: string;
  description?: string;
  descriptionEn?: string;
  descriptionBn?: string;
  logoUrl?: string;
  logoId?: string | null;
  bannerUrl?: string;
  bannerId?: string | null;
  website?: string;
  active?: boolean;
  featured?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
};

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrands: builder.query<ApiEnvelope<BrandsResponse>, string | ({ storeId: string } & ListQueryParams)>({
      query: (arg) => {
        if (typeof arg === "string") {
          return { url: `/brands/${arg}`, params: { page: 1, limit: 100 } };
        }
        const { storeId, ...params } = arg;
        return { url: `/brands/${storeId}`, params };
      },
      providesTags: (_result, _error, arg) => [{ type: "Brands" as any, id: typeof arg === "string" ? arg : arg.storeId }],
    }),
    getBrand: builder.query<ApiEnvelope<BrandResponse>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/brands/${storeId}/${id}` }),
      providesTags: (_result, _error, { id }) => [{ type: "Brands" as any, id }],
    }),
    createBrand: builder.mutation<ApiEnvelope<BrandResponse>, { storeId: string; data: CreateBrandPayload }>({
      query: ({ storeId, data }) => ({ url: `/brands/${storeId}/create`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Brands" as any, id: storeId }],
    }),
    updateBrand: builder.mutation<ApiEnvelope<BrandResponse>, { storeId: string; id: string; data: UpdateBrandPayload }>({
      query: ({ storeId, id, data }) => ({ url: `/brands/${storeId}/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Brands" as any, id: storeId }],
    }),
    deleteBrand: builder.mutation<ApiEnvelope<never>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/brands/${storeId}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Brands" as any, id: storeId }],
    }),
    reorderBrands: builder.mutation<ApiEnvelope<never>, { storeId: string; orderedIds: string[] }>({
      query: ({ storeId, orderedIds }) => ({ url: `/brands/${storeId}/reorder`, method: "PUT", body: { orderedIds } }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Brands" as any, id: storeId }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useReorderBrandsMutation,
} = brandApi;
