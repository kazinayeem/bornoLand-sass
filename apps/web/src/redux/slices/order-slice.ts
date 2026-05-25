import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type OrderData = {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
};

type OrderState = {
  latestOrder: OrderData | null;
  loading: boolean;
  error: string | null;
};

const initialState: OrderState = {
  latestOrder: null,
  loading: false,
  error: null
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLatestOrder(state, action: PayloadAction<OrderData>) {
      state.latestOrder = action.payload;
      state.error = null;
    },
    clearLatestOrder(state) {
      state.latestOrder = null;
    },
    setOrderLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setOrderError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    }
  }
});

export const { setLatestOrder, clearLatestOrder, setOrderLoading, setOrderError } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;
