import { baseApi } from "@/redux/api/base-api";

export type StoreSocialLinks = {
  facebook?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  youtube?: string;
  telegram?: string;
};

export type StoreContact = {
  _id?: string;
  storeId: string;
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  googleMapsEmbedUrl: string;
  latitude: string;
  longitude: string;
  businessHours: string;
  socialLinks: StoreSocialLinks;
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

export const storeContactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreContact: builder.query<ApiEnvelope<{ contact: StoreContact }>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/contact` }),
      providesTags: (_result, _error, storeId) => [{ type: "StoreContact", id: storeId }],
    }),
    updateStoreContact: builder.mutation<ApiEnvelope<{ contact: StoreContact }>, { storeId: string; data: Partial<StoreContact> }>({
      query: ({ storeId, data }) => ({ url: `/stores/${storeId}/contact`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "StoreContact", id: storeId }],
    }),
  }),
});

export const { useGetStoreContactQuery, useUpdateStoreContactMutation } = storeContactApi;
