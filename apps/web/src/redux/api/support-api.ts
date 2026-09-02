import { baseApi } from "@/redux/api/base-api";

export type TicketMessage = {
  sender: string;
  senderType: "customer" | "agent" | "system";
  content: string;
  attachments: string[];
  createdAt: string;
};

export type SupportTicket = {
  _id: string;
  storeId: string;
  ticketNumber: string;
  subject: string;
  customerId?: string | null;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderId?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  channel: string;
  messages: TicketMessage[];
  assignedTo: string;
  resolvedAt?: string | null;
  createdAt: string;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<
      ApiEnvelope<{ tickets: SupportTicket[]; total: number; page: number; totalPages: number }>,
      { storeId: string; status?: string; priority?: string; page?: number; limit?: number }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/support/tickets`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Notifications", id: `${storeId}-tickets` }],
    }),

    createTicket: builder.mutation<ApiEnvelope<SupportTicket>, { storeId: string; body: any }>({
      query: ({ storeId, body }) => ({
        url: `/stores/${storeId}/support/tickets`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Notifications", id: `${storeId}-tickets` }],
    }),

    addTicketReply: builder.mutation<
      ApiEnvelope<SupportTicket>,
      { storeId: string; ticketId: string; content: string; status?: string }
    >({
      query: ({ storeId, ticketId, ...body }) => ({
        url: `/stores/${storeId}/support/tickets/${ticketId}/reply`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Notifications", id: `${storeId}-tickets` }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useAddTicketReplyMutation,
} = supportApi;
