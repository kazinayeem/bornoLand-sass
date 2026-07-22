import { baseApi } from "@/redux/api/base-api";

export type CustomerData = {
  _id: string;
  name: string;
  email: string;
  storeId: string;
  phone?: string;
  avatar?: string;
  birthday?: string | null;
  gender?: string;
  createdAt?: string;
  totalOrders?: number;
};

export type CustomerAddress = {
  _id: string;
  customerId: string;
  storeId: string;
  label: "Home" | "Office" | "Other";
  fullName: string;
  phone: string;
  email?: string;
  country: string;
  state: string;
  city: string;
  area?: string;
  street: string;
  apartment?: string;
  zip?: string;
  landmark?: string;
  orderNotes?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerAddressPayload = Omit<CustomerAddress, "_id" | "customerId" | "storeId" | "createdAt" | "updatedAt">;

type AuthResponse = {
  customer: CustomerData;
  token: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function customerAuthHeaders(token?: string) {
  const resolved = token ?? (typeof window !== "undefined" ? localStorage.getItem("customer_token") : null);
  return resolved ? { Authorization: `Bearer ${resolved}` } : {};
}

export const customerApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    customerRegister: builder.mutation<ApiResponse<AuthResponse>, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/customer/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    customerLogin: builder.mutation<ApiResponse<AuthResponse>, { email: string; password: string }>({
      query: (body) => ({
        url: "/customer/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
    customerForgotPassword: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
      query: (body) => ({
        url: "/customer/forgot-password",
        method: "POST",
        body,
      }),
    }),
    getCustomerMe: builder.query<ApiResponse<{ customer: CustomerData }>, void>({
      query: () => ({
        url: "/customer/me",
        headers: customerAuthHeaders(),
      }),
      providesTags: ["Customer"],
    }),

    updateCustomerProfile: builder.mutation<ApiResponse<AuthResponse>, { name: string; phone: string; birthday?: string | null; gender?: string }>({
      query: (body) => ({
        url: "/customer/me",
        method: "PATCH",
        body,
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    changeCustomerPassword: builder.mutation<ApiResponse<{ token: string }>, { currentPassword: string; newPassword: string; confirmPassword: string }>({
      query: (body) => ({
        url: "/customer/me/change-password",
        method: "POST",
        body,
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    uploadCustomerAvatar: builder.mutation<ApiResponse<AuthResponse>, FormData>({
      query: (formData) => ({
        url: "/customer/me/avatar",
        method: "POST",
        body: formData,
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    removeCustomerAvatar: builder.mutation<ApiResponse<AuthResponse>, void>({
      query: () => ({
        url: "/customer/me/avatar",
        method: "DELETE",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    logoutAllCustomerDevices: builder.mutation<ApiResponse<unknown>, void>({
      query: () => ({
        url: "/customer/sessions/logout-all",
        method: "DELETE",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    getCustomerSessions: builder.query<
      ApiResponse<{ sessions: Array<{ _id: string; device: string; startedAt: string | null; isActive: boolean; ipAddress: string; userAgent: string }>; loginHistory: Array<{ _id: string; createdAt: string | null }> }>,
      void
    >({
      query: () => ({
        url: "/customer/sessions",
        headers: customerAuthHeaders(),
      }),
      providesTags: ["Customer"],
    }),

    getCustomerNotifications: builder.query<
      ApiResponse<{ notifications: Array<{ _id: string; title: string; message: string; type: string; icon?: string; priority?: string; read: boolean; createdAt: string; link?: string }>; unreadCount: number; pagination: { page: number; limit: number; total: number; pages: number } }>,
      { page?: number; limit?: number; unreadOnly?: boolean; type?: string; search?: string } | void
    >({
      query: (params) => ({
        url: "/customer/notifications",
        params: params || undefined,
        headers: customerAuthHeaders(),
      }),
      providesTags: ["Customer"],
    }),

    getCustomerUnreadNotificationCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => ({
        url: "/customer/notifications/unread-count",
        headers: customerAuthHeaders(),
      }),
      providesTags: ["Customer"],
    }),

    markCustomerNotificationRead: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/customer/notifications/${id}/read`,
        method: "PUT",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    markAllCustomerNotificationsRead: builder.mutation<ApiResponse<unknown>, void>({
      query: () => ({
        url: "/customer/notifications/read-all",
        method: "PUT",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),

    deleteCustomerNotification: builder.mutation<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/customer/notifications/${id}`,
        method: "DELETE",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),
    getCustomerAddresses: builder.query<ApiResponse<{ addresses: CustomerAddress[]; maxAddresses: number }>, void>({
      query: () => ({
        url: "/customer/addresses",
        headers: customerAuthHeaders(),
      }),
      providesTags: ["Customer"],
    }),
    createCustomerAddress: builder.mutation<ApiResponse<{ address: CustomerAddress }>, CustomerAddressPayload>({
      query: (body) => ({
        url: "/customer/addresses",
        method: "POST",
        body,
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),
    updateCustomerAddress: builder.mutation<ApiResponse<{ address: CustomerAddress }>, { id: string; data: Partial<CustomerAddressPayload> }>({
      query: ({ id, data }) => ({
        url: `/customer/addresses/${id}`,
        method: "PATCH",
        body: data,
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),
    setDefaultCustomerAddress: builder.mutation<ApiResponse<{ address: CustomerAddress }>, string>({
      query: (id) => ({
        url: `/customer/addresses/${id}/default`,
        method: "PATCH",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),
    deleteCustomerAddress: builder.mutation<ApiResponse<{ deleted: true }>, string>({
      query: (id) => ({
        url: `/customer/addresses/${id}`,
        method: "DELETE",
        headers: customerAuthHeaders(),
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useCustomerRegisterMutation,
  useCustomerLoginMutation,
  useCustomerForgotPasswordMutation,
  useGetCustomerMeQuery,
  useGetCustomerAddressesQuery,
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useSetDefaultCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
  useUpdateCustomerProfileMutation,
  useChangeCustomerPasswordMutation,
  useUploadCustomerAvatarMutation,
  useRemoveCustomerAvatarMutation,
  useLogoutAllCustomerDevicesMutation,
  useGetCustomerSessionsQuery,
  useGetCustomerNotificationsQuery,
  useGetCustomerUnreadNotificationCountQuery,
  useMarkCustomerNotificationReadMutation,
  useMarkAllCustomerNotificationsReadMutation,
  useDeleteCustomerNotificationMutation,
} = customerApi;
