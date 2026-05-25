import { baseApi } from "@/redux/api/base-api";

type DeliveryZoneData = {
  _id: string;
  storeId: string;
  name: string;
  charge: number;
  estimatedDays: string;
  enabled: boolean;
  sortOrder: number;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function authHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("customer_token")
      : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const deliveryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Dashboard (store owner) endpoints ── */
    getDeliveryZones: builder.query<
      ApiResponse<{ deliveryZones: DeliveryZoneData[] }>,
      string
    >({
      query: (storeId) => ({
        url: `/delivery-zones/store/${storeId}`,
        headers: authHeaders(),
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
        headers: authHeaders(),
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
        headers: authHeaders(),
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
        headers: authHeaders(),
      }),
      invalidatesTags: ["DeliveryZones"],
    }),

    /* ── Public (checkout) endpoints ── */
    getPublicDeliveryZones: builder.query<
      ApiResponse<{ deliveryZones: DeliveryZoneData[] }>,
      void
    >({
      query: () => ({
        url: "/public/delivery-zones",
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
