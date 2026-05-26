import { baseApi } from "@/redux/api/base-api";

export type StoreSettings = {
  _id: string;
  storeId: string;
  currencyCode: "USD" | "BDT" | "EUR" | "GBP" | "INR";
  currencySymbol: string;
  currencyPosition: "before" | "after";
  locale: string;
  decimalPlaces: number;
  taxRate: number;
  taxEnabled?: boolean;
  taxIncluded?: boolean;
  dateFormat: string;
  timezone: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HomepageSlider = {
  _id: string;
  storeId: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: number;
  isActive: boolean;
  overlayColor: string;
  textAlignment: "left" | "center" | "right";
  createdAt?: string;
  updatedAt?: string;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

type StoreSettingsResponse = { settings: StoreSettings | null };
type SliderResponse = { sliders: HomepageSlider[] };

export const storeSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreSettings: builder.query<ApiEnvelope<StoreSettingsResponse>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/settings` }),
      providesTags: (_result, _error, storeId) => [{ type: "StoreSettings", id: storeId }]
    }),
    updateStoreSettings: builder.mutation<ApiEnvelope<StoreSettingsResponse>, { storeId: string; data: Partial<StoreSettings> }>({
      query: ({ storeId, data }) => ({ url: `/stores/${storeId}/settings`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "StoreSettings", id: storeId }, { type: "HomepageSliders", id: storeId }]
    }),
    getHomepageSliders: builder.query<ApiEnvelope<SliderResponse>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/sliders` }),
      providesTags: (_result, _error, storeId) => [{ type: "HomepageSliders", id: storeId }]
    }),
    createHomepageSlider: builder.mutation<ApiEnvelope<{ slider: HomepageSlider }>, { storeId: string; data: Omit<HomepageSlider, "_id" | "storeId" | "createdAt" | "updatedAt"> }>({
      query: ({ storeId, data }) => ({ url: `/stores/${storeId}/sliders`, method: "POST", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "HomepageSliders", id: storeId }]
    }),
    updateHomepageSlider: builder.mutation<ApiEnvelope<{ slider: HomepageSlider }>, { storeId: string; sliderId: string; data: Partial<HomepageSlider> }>({
      query: ({ storeId, sliderId, data }) => ({ url: `/stores/${storeId}/sliders/${sliderId}`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "HomepageSliders", id: storeId }]
    }),
    deleteHomepageSlider: builder.mutation<ApiEnvelope<never>, { storeId: string; sliderId: string }>({
      query: ({ storeId, sliderId }) => ({ url: `/stores/${storeId}/sliders/${sliderId}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "HomepageSliders", id: storeId }]
    })
  })
});

export const {
  useGetStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
  useGetHomepageSlidersQuery,
  useCreateHomepageSliderMutation,
  useUpdateHomepageSliderMutation,
  useDeleteHomepageSliderMutation
} = storeSettingsApi;
