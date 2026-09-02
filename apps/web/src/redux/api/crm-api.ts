import { baseApi } from "@/redux/api/base-api";

export type CrmDeal = {
  _id: string;
  storeId: string;
  title: string;
  customerId?: string | null;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  value: number;
  currency: string;
  stage: "lead" | "contacted" | "proposal_sent" | "negotiation" | "won" | "lost";
  probabilityPercent: number;
  expectedCloseDate?: string | null;
  assignedTo: string;
  notes?: string;
  lostReason?: string;
  tags: string[];
  createdAt: string;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

export const crmApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query<
      ApiEnvelope<{
        deals: CrmDeal[];
        total: number;
        summary: { totalPipelineValue: number; wonValue: number; leadsCount: number; wonCount: number };
      }>,
      { storeId: string; stage?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/crm/deals`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "CRM", id: `${storeId}-deals` }],
    }),

    createDeal: builder.mutation<ApiEnvelope<CrmDeal>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/crm/deals`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "CRM", id: `${storeId}-deals` }],
    }),

    updateDealStage: builder.mutation<
      ApiEnvelope<CrmDeal>,
      { storeId: string; dealId: string; stage: string; notes?: string; lostReason?: string }
    >({
      query: ({ storeId, dealId, ...body }) => ({
        url: `/stores/${storeId}/crm/deals/${dealId}/stage`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "CRM", id: `${storeId}-deals` }],
    }),
  }),
});

export const { useGetDealsQuery, useCreateDealMutation, useUpdateDealStageMutation } = crmApi;
