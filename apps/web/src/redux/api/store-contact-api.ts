import { baseApi } from "@/redux/api/base-api";
import { assertApiSuccess, type ApiEnvelope } from "@/lib/api/envelope";

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

export type UpdateStoreContactPayload = {
  businessName?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  googleMapsEmbedUrl?: string;
  latitude?: string;
  longitude?: string;
  businessHours?: string;
  socialLinks?: StoreSocialLinks;
};

type StoreContactResponse = { contact: StoreContact };

function toUpdatePayload(form: UpdateStoreContactPayload): UpdateStoreContactPayload {
  return {
    businessName: form.businessName,
    email: form.email,
    phone: form.phone,
    whatsapp: form.whatsapp,
    address: form.address,
    city: form.city,
    country: form.country,
    postalCode: form.postalCode,
    googleMapsEmbedUrl: form.googleMapsEmbedUrl,
    latitude: form.latitude,
    longitude: form.longitude,
    businessHours: form.businessHours,
    socialLinks: form.socialLinks,
  };
}

export const storeContactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreContact: builder.query<StoreContact, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/contact` }),
      transformResponse: (response: ApiEnvelope<StoreContactResponse>) => {
        assertApiSuccess(response, "Failed to load contact information");
        return response.data!.contact;
      },
      providesTags: (_result, _error, storeId) => [{ type: "StoreContact", id: storeId }],
    }),
    updateStoreContact: builder.mutation<StoreContact, { storeId: string; data: UpdateStoreContactPayload }>({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/contact`,
        method: "PUT",
        body: toUpdatePayload(data),
      }),
      transformResponse: (response: ApiEnvelope<StoreContactResponse>) => {
        assertApiSuccess(response, "Failed to save contact information");
        return response.data!.contact;
      },
      async onQueryStarted({ storeId }, { dispatch, queryFulfilled }) {
        try {
          const { data: contact } = await queryFulfilled;
          dispatch(storeContactApi.util.updateQueryData("getStoreContact", storeId, () => contact));
        } catch {
          // Cache update is best-effort; invalidation handles refetch on failure.
        }
      },
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "StoreContact", id: storeId }],
    }),
  }),
});

export const { useGetStoreContactQuery, useUpdateStoreContactMutation } = storeContactApi;
