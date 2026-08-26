import { baseApi } from "@/redux/api/base-api";

export type PaymentMethodData = {
  _id: string;
  storeId: string;
  type: "cod" | "bkash" | "nagad" | "rocket" | "bank" | "stripe" | "sslcommerz" | "other";
  label: string;
  accountNumber: string;
  accountType: "personal" | "agent" | "merchant" | "";
  instructions: string;
  logoUrl?: string;
  bankName?: string;
  branch?: string;
  accountName?: string;
  routingNumber?: string;
  swift?: string;
  enabled: boolean;
  sortOrder: number;
};

export type SSLCommerzGatewayConfig = {
  provider: "sslcommerz";
  storeId: string;
  storeIdValue: string;
  hasPassword: boolean;
  maskedPassword: string;
  environment: "sandbox" | "live";
  isEnabled: boolean;
  isVerified: boolean;
  verifiedAt: string | null;
  lastTestedAt: string | null;
  lastError: string;
  updatedAt: string | null;
  featureAccess: {
    allowed: boolean;
    reason?: string;
    message?: string;
    currentPlan?: { slug: string; name: string };
  };
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

    /* ── Store Payment Gateway (SSLCommerz) endpoints ── */
    getStoreSSLCommerzConfig: builder.query<
      ApiResponse<SSLCommerzGatewayConfig>,
      string
    >({
      query: (storeId) => ({
        url: `/stores/${storeId}/payment-gateways/sslcommerz`,
      }),
      providesTags: ["PaymentMethods", "Store"],
    }),
    updateStoreSSLCommerzConfig: builder.mutation<
      ApiResponse<SSLCommerzGatewayConfig>,
      {
        storeId: string;
        data: {
          storeIdValue?: string;
          storePassword?: string;
          environment?: "sandbox" | "live";
          isEnabled?: boolean;
        };
      }
    >({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/payment-gateways/sslcommerz`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PaymentMethods", "Store"],
    }),
    testStoreSSLCommerzConnection: builder.mutation<
      ApiResponse<{ verified: boolean }>,
      {
        storeId: string;
        data?: {
          storeIdValue?: string;
          storePassword?: string;
          environment?: "sandbox" | "live";
        };
      }
    >({
      query: ({ storeId, data }) => ({
        url: `/stores/${storeId}/payment-gateways/sslcommerz/test`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PaymentMethods", "Store"],
    }),
    toggleStoreSSLCommerz: builder.mutation<
      ApiResponse<{ isEnabled: boolean }>,
      { storeId: string; enabled: boolean }
    >({
      query: ({ storeId, enabled }) => ({
        url: `/stores/${storeId}/payment-gateways/sslcommerz/toggle`,
        method: "POST",
        body: { enabled },
      }),
      invalidatesTags: ["PaymentMethods", "Store"],
    }),

    /* ── Public (checkout) endpoints ── */
    getPublicPaymentMethods: builder.query<
      ApiResponse<{ paymentMethods: PaymentMethodData[] }>,
      void
    >({
      query: () => ({
        url: "/public/payment-methods",
      }),
      providesTags: ["PaymentMethods"],
    }),
  }),
});

export const {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetStoreSSLCommerzConfigQuery,
  useUpdateStoreSSLCommerzConfigMutation,
  useTestStoreSSLCommerzConnectionMutation,
  useToggleStoreSSLCommerzMutation,
  useGetPublicPaymentMethodsQuery,
} = paymentApi;
