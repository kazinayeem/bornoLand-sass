import { baseApi } from "./base-api";
import type { Plan } from "./store-api";

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

export const publicPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicPlans: builder.query<ApiEnvelope<{ plans: Plan[] }>, void>({
      query: () => ({ url: "/plans/public" }),
      // Public plan data changes infrequently; polling keeps the marketing page current after admin edits.
      providesTags: ["Stores"],
    }),
  }),
});

export const { useGetPublicPlansQuery } = publicPlanApi;
