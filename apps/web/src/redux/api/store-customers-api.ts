import { baseApi } from "@/redux/api/base-api";

export type StoreCustomer = {
  _id: string;
  storeId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: string;
  lastLoginAt: string | null;
  totalOrders: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalSpent: number;
  lastOrderDate: string | null;
  averageOrderValue: number;
  notes: string;
  tags: string[];
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
  addresses?: Array<{
    _id: string;
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  }>;
};

export type CustomerOrder = {
  _id: string;
  orderNumber: string;
  invoiceNumber?: string;
  total: number;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt: string;
};

type ListCustomersResponse = {
  data: {
    customers: StoreCustomer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type CustomerDetailResponse = {
  data: {
    customer: StoreCustomer;
    orders: CustomerOrder[];
    wishlist?: Array<{ productId?: string; name?: string; price?: number; image?: string }>;
    activity?: Array<{
      type: string;
      orderNumber?: string;
      status?: string;
      note?: string;
      createdAt?: string;
    }>;
    analytics?: {
      totalOrders: number;
      completedOrders: number;
      cancelledOrders: number;
      totalSpent: number;
      averageOrderValue: number;
      lastOrderDate: string | null;
      wishlistCount: number;
    };
  };
};

type CustomerFilters = {
  storeId: string;
  search?: string;
  page?: string;
  limit?: string;
  status?: string;
};

export const storeCustomerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreCustomers: builder.query<ListCustomersResponse, CustomerFilters>({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/customers`,
        params,
      }),
      providesTags: (_result, _error, { storeId }) => [{ type: "Customers", id: storeId }],
    }),
    getStoreCustomer: builder.query<CustomerDetailResponse, { storeId: string; customerId: string }>({
      query: ({ storeId, customerId }) => ({
        url: `/stores/${storeId}/customers/${customerId}`,
      }),
      providesTags: (_result, _error, { storeId, customerId }) => [
        { type: "Customers", id: storeId },
        { type: "Customers", id: `${storeId}_${customerId}` },
      ],
    }),
    updateStoreCustomer: builder.mutation<
      { data: { customer: StoreCustomer } },
      { storeId: string; customerId: string; body: Partial<{ name: string; email: string; phone: string; status: string; notes: string; tags: string[] }> }
    >({
      query: ({ storeId, customerId, body }) => ({
        url: `/stores/${storeId}/customers/${customerId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { storeId, customerId }) => [
        { type: "Customers", id: storeId },
        { type: "Customers", id: `${storeId}_${customerId}` },
      ],
    }),
  }),
});

export const {
  useGetStoreCustomersQuery,
  useLazyGetStoreCustomersQuery,
  useGetStoreCustomerQuery,
  useUpdateStoreCustomerMutation,
} = storeCustomerApi;
