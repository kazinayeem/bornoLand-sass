import { baseApi } from "./base-api";

export type IncompleteCheckoutItem = {
  _id?: string;
  productId: string;
  variantId?: string | null;
  variantTitle?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  liveStatus?: {
    exists: boolean;
    active: boolean;
    inStock: boolean;
    availableStock: number;
    currentPrice: number;
    priceChanged: boolean;
  };
};

export type IncompleteCheckoutTimeline = {
  _id?: string;
  status: string;
  note: string;
  timestamp: string;
};

export type IncompleteCheckout = {
  _id: string;
  storeId: string;
  customerId?: string;
  sessionId: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  street?: string;
  apartment?: string;
  city?: string;
  area?: string;
  state?: string;
  zip?: string;
  country?: string;
  landmark?: string;
  notes?: string;
  items: IncompleteCheckoutItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  couponCode?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  status: "in_progress" | "abandoned" | "recovered" | "converted" | "expired";
  step?: string;
  startedAt: string;
  lastActivityAt: string;
  abandonedAt?: string | null;
  recoveredAt?: string | null;
  convertedAt?: string | null;
  expiresAt?: string | null;
  convertedOrderId?: {
    _id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
  } | null;
  recoveryToken?: string;
  timeline: IncompleteCheckoutTimeline[];
  createdAt: string;
  updatedAt: string;
};

export type IncompleteCheckoutsStats = {
  totalIncomplete: number;
  incompleteValue: number;
  abandonedCount: number;
  inProgressCount: number;
  recoveredCount: number;
  convertedCount: number;
  convertedValue: number;
  totalSessions: number;
  recoveryRate: number;
  conversionRate: number;
};

export type IncompleteCheckoutsResponse = {
  success: boolean;
  entitlement?: {
    allowed: boolean;
    featureName: string;
    currentPlan?: { slug: string; name: string };
    requiredPlan?: { slug: string; name: string; priceBDT?: number };
  };
  data: {
    checkouts: IncompleteCheckout[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: IncompleteCheckoutsStats;
  };
};

export type IncompleteCheckoutDetailResponse = {
  success: boolean;
  data: {
    checkout: IncompleteCheckout;
  };
};

export type TrackCheckoutProgressPayload = {
  storeId: string;
  sessionId: string;
  customerId?: string | null;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  street?: string;
  apartment?: string;
  city?: string;
  area?: string;
  state?: string;
  zip?: string;
  country?: string;
  landmark?: string;
  notes?: string;
  step?: string;
  items?: Array<{
    productId: string;
    variantId?: string | null;
    variantTitle?: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    sku?: string;
  }>;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  tax?: number;
  total?: number;
  couponCode?: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  shippingMethod?: string;
  paymentMethod?: string;
};

export type RecoverCheckoutResponse = {
  success: boolean;
  message?: string;
  isConverted?: boolean;
  convertedOrderId?: string;
  data?: {
    store: {
      _id: string;
      name: string;
      slug: string;
      subdomain?: string;
    };
    checkout: {
      _id: string;
      sessionId: string;
      customerName?: string;
      phone?: string;
      email?: string;
      address?: string;
      street?: string;
      apartment?: string;
      city?: string;
      area?: string;
      state?: string;
      zip?: string;
      country?: string;
      landmark?: string;
      notes?: string;
      deliveryZoneId?: string;
      paymentMethod?: string;
      couponCode?: string;
      items: IncompleteCheckoutItem[];
      subtotal: number;
    };
  };
};

export const incompleteCheckoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreIncompleteCheckouts: builder.query<
      IncompleteCheckoutsResponse,
      {
        storeId: string;
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        from?: string;
        to?: string;
        minTotal?: number;
        maxTotal?: number;
        preset?: string;
      }
    >({
      query: ({ storeId, ...params }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set("page", String(params.page));
        if (params.limit) queryParams.set("limit", String(params.limit));
        if (params.search) queryParams.set("search", params.search);
        if (params.status && params.status !== "all") queryParams.set("status", params.status);
        if (params.from) queryParams.set("from", params.from);
        if (params.to) queryParams.set("to", params.to);
        if (params.minTotal !== undefined) queryParams.set("minTotal", String(params.minTotal));
        if (params.maxTotal !== undefined) queryParams.set("maxTotal", String(params.maxTotal));
        if (params.preset) queryParams.set("preset", params.preset);

        return {
          url: `/stores/${storeId}/incomplete-checkouts?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["IncompleteCheckouts"],
    }),

    getStoreIncompleteCheckoutDetail: builder.query<
      IncompleteCheckoutDetailResponse,
      { storeId: string; checkoutId: string }
    >({
      query: ({ storeId, checkoutId }) => ({
        url: `/stores/${storeId}/incomplete-checkouts/${checkoutId}`,
        method: "GET",
      }),
      providesTags: ["IncompleteCheckouts"],
    }),

    generateRecoveryLink: builder.mutation<
      { success: boolean; data: { recoveryToken: string; recoveryUrl: string; expiresAt?: string } },
      { storeId: string; checkoutId: string }
    >({
      query: ({ storeId, checkoutId }) => ({
        url: `/stores/${storeId}/incomplete-checkouts/${checkoutId}/recovery-link`,
        method: "POST",
      }),
      invalidatesTags: ["IncompleteCheckouts"],
    }),

    trackCheckoutProgress: builder.mutation<
      { success: boolean; data: { checkoutId: string; recoveryToken?: string; status: string } },
      TrackCheckoutProgressPayload
    >({
      query: ({ storeId, ...payload }) => ({
        url: `/orders/incomplete/track`,
        method: "POST",
        body: { storeId, ...payload },
      }),
    }),

    recoverCheckout: builder.query<RecoverCheckoutResponse, string>({
      query: (token) => ({
        url: `/orders/recover/${token}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetStoreIncompleteCheckoutsQuery,
  useGetStoreIncompleteCheckoutDetailQuery,
  useGenerateRecoveryLinkMutation,
  useTrackCheckoutProgressMutation,
  useRecoverCheckoutQuery,
  useLazyRecoverCheckoutQuery,
} = incompleteCheckoutApi;
