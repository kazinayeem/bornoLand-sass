import { baseApi } from "./base-api";

export type CourierProviderSlug =
  | "pathao"
  | "redx"
  | "steadfast"
  | "paperfly"
  | "sundarban";

export type CourierCredentialField = {
  key: string;
  label: string;
  secret: boolean;
  set: boolean;
};

export type CourierShipmentSettings = {
  autoCreateShipment: boolean;
  autoSyncTracking: boolean;
  autoRefreshTracking: "5" | "15" | "30" | "manual";
  codEnabled: boolean;
  defaultWeightKg: number;
  defaultDeliveryType: string;
};

export type StoreCourierConfig = {
  provider: CourierProviderSlug;
  name: string;
  credentialFields: CourierCredentialField[];
  enabled: boolean;
  sandbox: boolean;
  connectionStatus: "connected" | "not_connected" | "error";
  lastTestedAt: string | null;
  lastError: string;
  environment: "sandbox" | "production";
  shipmentSettings: CourierShipmentSettings;
  storeId: string;
  updatedAt?: string;
};

export type CourierAccessInfo = {
  enabled: boolean;
  providers: CourierProviderSlug[];
  planProviders: CourierProviderSlug[];
  storeProviders?: CourierProviderSlug[];
  currentPlan?: { slug: string; name: string };
};

export const courierApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStoreCouriers: build.query<
      {
        data: {
          access: CourierAccessInfo;
          couriers: StoreCourierConfig[];
          catalog: Array<{ slug: CourierProviderSlug; name: string; available: boolean }>;
        };
      },
      string
    >({
      query: (storeId) => `/stores/${storeId}/couriers`,
      providesTags: (_r, _e, storeId) => [{ type: "StoreCouriers" as const, id: storeId }],
    }),
    getStoreCourierAccess: build.query<{ data: { access: CourierAccessInfo } }, string>({
      query: (storeId) => `/stores/${storeId}/couriers/access`,
      providesTags: (_r, _e, storeId) => [{ type: "StoreCouriers" as const, id: `${storeId}-access` }],
    }),
    updateStoreCourier: build.mutation<
      { data: { courier: StoreCourierConfig } },
      {
        storeId: string;
        provider: CourierProviderSlug;
        data: {
          enabled?: boolean;
          sandbox?: boolean;
          credentials?: Record<string, string>;
          shipmentSettings?: Partial<CourierShipmentSettings>;
        };
      }
    >({
      query: ({ storeId, provider, data }) => ({
        url: `/stores/${storeId}/couriers/${provider}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StoreCouriers" as const, id: storeId }],
    }),
    testStoreCourier: build.mutation<
      {
        data: {
          test: { ok: boolean; message: string; environment: string; testedAt: string };
          courier: StoreCourierConfig;
        };
      },
      { storeId: string; provider: CourierProviderSlug }
    >({
      query: ({ storeId, provider }) => ({
        url: `/stores/${storeId}/couriers/${provider}/test`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StoreCouriers" as const, id: storeId }],
    }),
    updateStoreCourierAccess: build.mutation<
      { data: { providers: CourierProviderSlug[] } },
      { storeId: string; providers: CourierProviderSlug[] }
    >({
      query: ({ storeId, providers }) => ({
        url: `/stores/${storeId}/couriers/access`,
        method: "PUT",
        body: { providers },
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "StoreCouriers" as const, id: storeId }],
    }),
  }),
});

export const {
  useGetStoreCouriersQuery,
  useGetStoreCourierAccessQuery,
  useUpdateStoreCourierMutation,
  useTestStoreCourierMutation,
  useUpdateStoreCourierAccessMutation,
} = courierApi;
