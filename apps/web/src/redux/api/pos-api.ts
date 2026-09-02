import { baseApi } from "@/redux/api/base-api";

export type PosShift = {
  _id: string;
  storeId: string;
  terminalId: string;
  cashierId: string;
  cashierName: string;
  openingFloat: number;
  expectedClosingCash: number;
  actualClosingCash?: number | null;
  cashDiscrepancy?: number | null;
  totalCashSales: number;
  totalCardSales: number;
  totalMfsSales: number;
  totalRefunds: number;
  totalOrdersCount: number;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string | null;
  closingNotes?: string;
  createdAt: string;
};

export type ApiEnvelope<T> = {
  ok: boolean;
  data: T;
  message?: string;
};

export const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentPosShift: builder.query<ApiEnvelope<PosShift | null>, string>({
      query: (storeId) => ({ url: `/stores/${storeId}/pos/shifts/current` }),
      providesTags: (_r, _e, storeId) => [{ type: "Orders", id: `${storeId}-pos-shift` }],
    }),

    openPosShift: builder.mutation<
      ApiEnvelope<PosShift>,
      { storeId: string; openingFloat: number; terminalId?: string; warehouseId?: string }
    >({
      query: ({ storeId, ...body }) => ({
        url: `/stores/${storeId}/pos/shifts/open`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Orders", id: `${storeId}-pos-shift` }],
    }),

    closePosShift: builder.mutation<
      ApiEnvelope<PosShift>,
      { storeId: string; shiftId: string; actualClosingCash: number; closingNotes?: string }
    >({
      query: ({ storeId, shiftId, ...body }) => ({
        url: `/stores/${storeId}/pos/shifts/${shiftId}/close`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { storeId }) => [{ type: "Orders", id: `${storeId}-pos-shift` }],
    }),

    listPosShifts: builder.query<
      ApiEnvelope<{ shifts: PosShift[]; total: number; page: number; totalPages: number }>,
      { storeId: string; page?: number; limit?: number; cashierId?: string }
    >({
      query: ({ storeId, ...params }) => ({
        url: `/stores/${storeId}/pos/shifts`,
        params,
      }),
      providesTags: (_r, _e, { storeId }) => [{ type: "Orders", id: `${storeId}-pos-shifts-list` }],
    }),
  }),
});

export const {
  useGetCurrentPosShiftQuery,
  useOpenPosShiftMutation,
  useClosePosShiftMutation,
  useListPosShiftsQuery,
} = posApi;
