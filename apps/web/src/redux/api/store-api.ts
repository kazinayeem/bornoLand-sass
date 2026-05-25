import { baseApi } from "@/redux/api/base-api";

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  buttonStyle: string;
  layoutWidth: string;
  darkMode: boolean;
  navbarStyle: string;
};

export type Plan = {
  _id: string;
  name: string;
  slug: string;
  priceBDT: number;
  trialDays: number;
  features: string[];
  limits: { stores: number; products: number; staff: number; bandwidthGB: number };
  isRecommended: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

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
  planId?: Plan | string | null;
  billingStatus?: "trial" | "active" | "past_due" | "cancelled" | "paused";
  subscriptionStatus?: "trialing" | "active" | "past_due" | "cancelled" | "paused";
  renewalDate?: string | null;
  status: string;
  logoUrl: string;
  selectedTemplateId?: { _id: string; name: string; slug: string; category: string; preview: string } | string;
  theme: ThemeSettings;
  productCount?: number;
  orderCount?: number;
  revenueBDT?: number;
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
  selectedTemplateId?: string;
  logoUrl?: string;
};

type UpdateStoreRequest = Partial<CreateStoreRequest> & {
  status?: string;
  theme?: Partial<ThemeSettings>;
  planId?: string;
  billingStatus?: Store["billingStatus"];
  subscriptionStatus?: Store["subscriptionStatus"];
  renewalDate?: string;
};

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
    changeStoreTheme: builder.mutation<ApiEnvelope<{ store: Store }>, { id: string; data: { templateId?: string; theme?: Partial<ThemeSettings> } }>({
      query: ({ id, data }) => ({ url: `/stores/${id}/theme`, method: "PUT", body: data }),
      invalidatesTags: (_result, _error, { id }) => ["Stores", { type: "Stores", id }]
    }),
    deleteStore: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/stores/${id}`, method: "DELETE" }),
      invalidatesTags: ["Stores"]
    }),
    getPlans: builder.query<ApiEnvelope<{ plans: Plan[] }>, void>({
      query: () => ({ url: "/plans" }),
      providesTags: ["Stores"]
    }),
    createPlan: builder.mutation<ApiEnvelope<{ plan: Plan }>, Omit<Plan, "_id" | "createdAt" | "updatedAt">>({
      query: (body) => ({ url: "/plans", method: "POST", body }),
      invalidatesTags: ["Stores"]
    }),
    updatePlan: builder.mutation<ApiEnvelope<{ plan: Plan }>, { id: string; data: Partial<Omit<Plan, "_id" | "createdAt" | "updatedAt">> }>({
      query: ({ id, data }) => ({ url: `/plans/${id}`, method: "PUT", body: data }),
      invalidatesTags: ["Stores"]
    }),
    deletePlan: builder.mutation<ApiEnvelope<never>, string>({
      query: (id) => ({ url: `/plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["Stores"]
    })
  })
});

export const {
  useCreateStoreMutation,
  useGetMyStoresQuery,
  useGetStoreQuery,
  useUpdateStoreMutation,
  useChangeStoreThemeMutation,
  useDeleteStoreMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation
} = storeApi;
