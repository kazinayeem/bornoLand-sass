import { baseApi } from "@/redux/api/base-api";

export type Product = {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  stock: number;
  status: "active" | "inactive";
  sku: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  images: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type CreateProductRequest = {
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  category?: string;
  stock?: number;
  status?: "active" | "inactive";
  sku?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  galleryImageUrls?: string[];
  images?: string[];
  featured?: boolean;
};

type UpdateProductRequest = Partial<CreateProductRequest>;

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiEnvelope<{ products: Product[] }>, string>({
      query: (storeId) => ({ url: `/products/${storeId}` }),
      providesTags: (_result, _error, storeId) => [{ type: "Products", id: storeId }]
    }),
    getProduct: builder.query<ApiEnvelope<{ product: Product }>, string>({
      query: (id) => ({ url: `/products/item/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Products", id }]
    }),
    createProduct: builder.mutation<ApiEnvelope<{ product: Product }>, { storeId: string; data: CreateProductRequest }>({
      query: ({ storeId, data }) => ({ url: `/products/${storeId}/create`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    }),
    updateProduct: builder.mutation<ApiEnvelope<{ product: Product }>, { storeId: string; id: string; data: UpdateProductRequest }>({
      query: ({ storeId, id, data }) => ({ url: `/products/${storeId}/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    }),
    deleteProduct: builder.mutation<ApiEnvelope<never>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/products/${storeId}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    }),
    duplicateProduct: builder.mutation<ApiEnvelope<{ product: Product }>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/products/${storeId}/${id}/duplicate`, method: "POST" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    })
  })
});

export const {
  useGetProductsQuery, useGetProductQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation, useDuplicateProductMutation
} = productApi;
