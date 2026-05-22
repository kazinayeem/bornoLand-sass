import { baseApi } from "@/redux/api/base-api";

export type Store = {
  _id: string;
  tenantId: string;
  userId: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string;
  category: string;
  plan: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type CreateStoreRequest = {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  plan?: string;
};

type UpdateStoreRequest = Partial<CreateStoreRequest> & { status?: string };

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStore: builder.mutation<ApiEnvelope<{ store: Store }>, CreateStoreRequest>({
      query: (body) => ({ url: "/stores/create", method: "POST", body }),
      invalidatesTags: ["Stores"]
    }),
    getMyStores: builder.query<ApiEnvelope<{ stores: Store[] }>, void>({
      query: () => ({ url: "/stores/my-stores" }),
      providesTags: ["Stores"]
    }),
    getStore: builder.query<ApiEnvelope<{ store: Store }>, string>({
      query: (id) => ({ url: `/stores/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Stores", id }]
    }),
    updateStore: builder.mutation<ApiEnvelope<{ store: Store }>, { id: string; data: UpdateStoreRequest }>({
      query: ({ id, data }) => ({ url: `/stores/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => ["Stores", { type: "Stores", id }]
    }),
    deleteStore: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/stores/${id}`, method: "DELETE" }),
      invalidatesTags: ["Stores"]
    })
  })
});

export const {
  useCreateStoreMutation,
  useGetMyStoresQuery,
  useGetStoreQuery,
  useUpdateStoreMutation,
  useDeleteStoreMutation
} = storeApi;
