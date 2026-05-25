import { baseApi } from "@/redux/api/base-api";

export type PaymentMethodData = {
  _id: string;
  storeId: string;
  type: "cod" | "bkash" | "nagad" | "rocket" | "bank";
  label: string;
  accountNumber: string;
  accountType: "personal" | "agent" | "merchant" | "";
  instructions: string;
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

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Dashboard (store owner) endpoints ── */
    getPaymentMethods: builder.query<
      ApiResponse<{ paymentMethods: PaymentMethodData[] }>,
      string
    >({
      query: (storeId) => ({
        url: `/payment-methods/store/${storeId}`,
        headers: authHeaders(),
      }),
      providesTags: ["PaymentMethods"],
    }),
    createPaymentMethod: builder.mutation<
      ApiResponse<{ paymentMethod: PaymentMethodData }>,
      { storeId: string; data: Partial<PaymentMethodData> }
    >({
      query: ({ storeId, data }) => ({
        url: `/payment-methods/store/${storeId}`,
        method: "POST",
        body: data,
        headers: authHeaders(),
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    updatePaymentMethod: builder.mutation<
      ApiResponse<{ paymentMethod: PaymentMethodData }>,
      { storeId: string; id: string; data: Partial<PaymentMethodData> }
    >({
      query: ({ storeId, id, data }) => ({
        url: `/payment-methods/store/${storeId}/${id}`,
        method: "PUT",
        body: data,
        headers: authHeaders(),
      }),
      invalidatesTags: ["PaymentMethods"],
    }),
    deletePaymentMethod: builder.mutation<
      ApiResponse<never>,
      { storeId: string; id: string }
    >({
      query: ({ storeId, id }) => ({
        url: `/payment-methods/store/${storeId}/${id}`,
        method: "DELETE",
        headers: authHeaders(),
      }),
      invalidatesTags: ["PaymentMethods"],
    }),

    /* ── Public (checkout) endpoints ── */
    getPublicPaymentMethods: builder.query<
      ApiResponse<{ paymentMethods: PaymentMethodData[] }>,
      void
    >({
      query: () => ({
        url: "/public/payment-methods",
      }),
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPublicPaymentMethodsQuery,
} = paymentApi;
