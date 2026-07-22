import { baseApi } from "@/redux/api/base-api";
import type { ListQueryParams, PaginationMeta } from "@/types/pagination";

export type ProductOption = {
  _id?: string;
  name: string;
  values: string[];
  displayType?: "dropdown" | "button" | "color_swatch" | "image_swatch";
  position?: number;
};

export type ProductVariant = {
  _id?: string;
  title?: string;
  optionValues: Record<string, string>;
  price?: number;
  comparePrice?: number;
  wholesalePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  sku: string;
  barcode?: string;
  imageUrl: string;
  imageMediaIds?: string[];
  galleryUrls?: string[];
  enabled: boolean;
  status?: "active" | "draft" | "out_of_stock" | "archived" | "hidden";
  isDefault?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  allowPreOrder?: boolean;
  allowBackorder?: boolean;
  isComingSoon?: boolean;
  weight?: number;
  weightUnit?: string;
};

export type Product = {
  _id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  productType?: "simple" | "variable" | "digital" | "service" | "downloadable";
  price: number;
  comparePrice?: number;
  priceMin?: number;
  priceMax?: number;
  priceRange?: { min: number; max: number };
  totalStock?: number;
  variantCount?: number;
  category: string;
  stock: number;
  status: "active" | "inactive" | "draft" | "archived";
  sku: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  featuredImageId?: string | null;
  galleryImageIds?: string[];
  galleryImageUrls?: string[];
  images: string[];
  featured: boolean;
  categoryIds?: string[];
  options?: ProductOption[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

export type PublicProductPageData = {
  store: {
    _id: string;
    name: string;
    slug: string;
    subdomain: string;
    description: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      font: string;
      buttonStyle: string;
      layoutWidth: string;
      darkMode: boolean;
      navbarStyle: string;
    };
    logoUrl?: string;
  };
  tenant: Record<string, unknown> | null;
  settings: {
    currencyCode: "USD" | "BDT" | "EUR" | "INR";
    currencySymbol: string;
    currencyPosition: "before" | "after";
    locale: string;
    decimalPlaces: number;
    taxRate: number;
  };
  sliders: unknown[];
  products: Product[];
  product: Product;
  relatedProducts: Product[];
};

export type CreateProductRequest = {
  name: string;
  slug: string;
  description?: string;
  productType?: "simple" | "variable" | "digital" | "service" | "downloadable";
  price: number;
  comparePrice?: number;
  category?: string;
  stock?: number;
  status?: "active" | "inactive" | "draft" | "archived";
  sku?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  featuredImageId?: string | null;
  galleryImageIds?: string[];
  galleryImageUrls?: string[];
  images?: string[];
  featured?: boolean;
  categoryIds?: string[];
  options?: ProductOption[];
  variants?: ProductVariant[];
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

type CreateVariantRequest = {
  optionValues: Record<string, string>;
  price?: number;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  enabled?: boolean;
};

type UpdateVariantRequest = Partial<CreateVariantRequest>;

type ProductsListResponse = {
  products: Product[];
  pagination?: PaginationMeta;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type ProductsListQuery = { storeId: string } & ListQueryParams;
export type PublicProductsListQuery = ListQueryParams;

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiEnvelope<ProductsListResponse>, ProductsListQuery | string>({
      query: (arg) => {
        if (typeof arg === "string") {
          return { url: `/products/${arg}`, params: { page: 1, limit: 20 } };
        }
        const { storeId, ...params } = arg;
        return { url: `/products/${storeId}`, params };
      },
      providesTags: (_result, _error, arg) => [{ type: "Products", id: typeof arg === "string" ? arg : arg.storeId }],
    }),
    getProduct: builder.query<ApiEnvelope<{ product: Product }>, string>({
      query: (id) => ({ url: `/products/item/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Products", id }]
    }),
    getPublicProduct: builder.query<ApiEnvelope<PublicProductPageData>, string>({
      query: (slug) => ({ url: `/products/${slug}` }),
      providesTags: (_result, _error, slug) => [{ type: "Products", id: slug }]
    }),
    getPublicProducts: builder.query<ApiEnvelope<ProductsListResponse>, PublicProductsListQuery | void>({
      query: (params) => ({ url: "/public/products", params: params ?? undefined }),
      providesTags: () => [{ type: "Products", id: "public-list" }],
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
    }),
    createVariant: builder.mutation<ApiEnvelope<{ product: Product }>, { storeId: string; id: string; data: CreateVariantRequest }>({
      query: ({ storeId, id, data }) => ({ url: `/products/${storeId}/${id}/variants`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    }),
    updateVariant: builder.mutation<ApiEnvelope<{ product: Product }>, { storeId: string; id: string; variantId: string; data: UpdateVariantRequest }>({
      query: ({ storeId, id, variantId, data }) => ({ url: `/products/${storeId}/${id}/variants/${variantId}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    }),
    deleteVariant: builder.mutation<ApiEnvelope<never>, { storeId: string; id: string; variantId: string }>({
      query: ({ storeId, id, variantId }) => ({ url: `/products/${storeId}/${id}/variants/${variantId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "Products", id: storeId }]
    }),
    syncVariants: builder.mutation<
      ApiEnvelope<{ product: Product }>,
      { storeId: string; id: string; data: { options: ProductOption[]; variants: ProductVariant[]; productType?: string } }
    >({
      query: ({ storeId, id, data }) => ({
        url: `/products/${storeId}/${id}/variants/sync`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { storeId, id }) => [
        { type: "Products", id: storeId },
        { type: "Products", id },
      ],
    }),
    generateVariants: builder.mutation<ApiEnvelope<{ product: Product }>, { storeId: string; id: string }>({
      query: ({ storeId, id }) => ({ url: `/products/${storeId}/${id}/variants/generate`, method: "POST" }),
      invalidatesTags: (_result, _error, { storeId, id }) => [
        { type: "Products", id: storeId },
        { type: "Products", id },
      ],
    }),
    bulkUpdateVariants: builder.mutation<
      ApiEnvelope<{ product?: Product; deleted?: number }>,
      { storeId: string; id: string; data: { variantIds: string[]; action: string; price?: number; stock?: number } }
    >({
      query: ({ storeId, id, data }) => ({
        url: `/products/${storeId}/${id}/variants/bulk`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { storeId, id }) => [
        { type: "Products", id: storeId },
        { type: "Products", id },
      ],
    }),
  })
});

export const {
  useGetProductsQuery, useGetProductQuery, useLazyGetProductQuery, useGetPublicProductQuery, useGetPublicProductsQuery, useCreateProductMutation,
  useUpdateProductMutation, useDeleteProductMutation, useDuplicateProductMutation,
  useCreateVariantMutation, useUpdateVariantMutation, useDeleteVariantMutation,
  useSyncVariantsMutation, useGenerateVariantsMutation, useBulkUpdateVariantsMutation,
} = productApi;
