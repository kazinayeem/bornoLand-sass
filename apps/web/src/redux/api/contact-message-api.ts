import { baseApi } from "@/redux/api/base-api";

export type ContactMessageStatus = "new" | "read" | "replied" | "closed" | "spam";

export type ContactMessage = {
  _id: string;
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactMessageStatus;
  notes?: string;
  archivedAt?: string | null;
  repliedAt?: string | null;
  createdAt: string;
};

type ListResponse = {
  messages: ContactMessage[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: Partial<Record<ContactMessageStatus, number>>;
};

type ApiEnvelope<T> = { success: boolean; data?: T; message?: string };

export const contactMessageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query<
      ApiEnvelope<ListResponse>,
      { storeId: string; page?: number; limit?: number; search?: string; status?: ContactMessageStatus; archived?: "true" | "false" }
    >({
      query: ({ storeId, page = 1, limit = 20, search, status, archived }) => ({
        url: `/stores/${storeId}/contact-messages`,
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(archived ? { archived } : {}),
        },
      }),
      providesTags: (result, _error, { storeId }) => [
        { type: "ContactMessages", id: storeId },
        ...(result?.data?.messages ?? []).map((message) => ({ type: "ContactMessages" as const, id: message._id })),
      ],
    }),
    getContactMessage: builder.query<ApiEnvelope<{ message: ContactMessage }>, { storeId: string; messageId: string }>({
      query: ({ storeId, messageId }) => ({ url: `/stores/${storeId}/contact-messages/${messageId}` }),
      providesTags: (_result, _error, { messageId }) => [{ type: "ContactMessages", id: messageId }],
    }),
    updateContactMessage: builder.mutation<
      ApiEnvelope<{ message: ContactMessage }>,
      { storeId: string; messageId: string; data: { status?: ContactMessageStatus; notes?: string; archived?: boolean } }
    >({
      query: ({ storeId, messageId, data }) => ({
        url: `/stores/${storeId}/contact-messages/${messageId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { storeId, messageId }) => [
        { type: "ContactMessages", id: storeId },
        { type: "ContactMessages", id: messageId },
      ],
    }),
    deleteContactMessage: builder.mutation<ApiEnvelope<{ deleted: boolean }>, { storeId: string; messageId: string }>({
      query: ({ storeId, messageId }) => ({
        url: `/stores/${storeId}/contact-messages/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: "ContactMessages", id: storeId }],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useGetContactMessageQuery,
  useUpdateContactMessageMutation,
  useDeleteContactMessageMutation,
} = contactMessageApi;
