import { baseApi } from "@/redux/api/base-api";

export type DeliveryZoneData = {
  _id: string;
  storeId: string;
  name: string;
  charge: number;
  estimatedDays: string;
  enabled: boolean;
  sortOrder: number;
  divisions?: string[];
  districts?: string[];
  postalCodes?: string[];
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const deliveryApi = baseApi.injectEndpoints({

  endpoints: (builder) => ({
    /* ── Dashboard (store owner) endpoints ── */
    getDeliveryZones: builder.query<
      ApiResponse<{ deliveryZones: DeliveryZoneData[] }>,
      string
    >({
      query: (storeId) => ({
        url: `/delivery-zones/store/${storeId}`,
      }),
      providesTags: ["DeliveryZones"],
    }),
    createDeliveryZone: builder.mutation<
      ApiResponse<{ deliveryZone: DeliveryZoneData }>,
      { storeId: string; data: Partial<DeliveryZoneData> }
    >({
      query: ({ storeId, data }) => ({
        url: `/delivery-zones/store/${storeId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DeliveryZones"],
    }),
    updateDeliveryZone: builder.mutation<
      ApiResponse<{ deliveryZone: DeliveryZoneData }>,
      { storeId: string; id: string; data: Partial<DeliveryZoneData> }
    >({
      query: ({ storeId, id, data }) => ({
        url: `/delivery-zones/store/${storeId}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["DeliveryZones"],
    }),
    deleteDeliveryZone: builder.mutation<
      ApiResponse<never>,
      { storeId: string; id: string }
    >({
      query: ({ storeId, id }) => ({
        url: `/delivery-zones/store/${storeId}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DeliveryZones"],
    }),


    /* ── Public (checkout) endpoints ── */
    getPublicDeliveryZones: builder.query<
      ApiResponse<{ deliveryZones: DeliveryZoneData[] }>,
      string | void
    >({
      query: (storeId) => ({
        url: storeId ? `/public/delivery-zones?storeId=${storeId}` : "/public/delivery-zones",
      }),
    }),
  }),
});

export const {
  useGetDeliveryZonesQuery,
  useCreateDeliveryZoneMutation,
  useUpdateDeliveryZoneMutation,
  useDeleteDeliveryZoneMutation,
  useGetPublicDeliveryZonesQuery,
} = deliveryApi;
