import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type BillingDrawerMode = "overview" | "plan" | "invoice" | "payment";

type BillingState = {
  isOpen: boolean;
  mode: BillingDrawerMode;
  storeId: string | null;
};

const initialState: BillingState = {
  isOpen: false,
  mode: "overview",
  storeId: null
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    openBillingDrawer(state, action: PayloadAction<{ storeId: string; mode?: BillingDrawerMode }>) {
      state.isOpen = true;
      state.storeId = action.payload.storeId;
      state.mode = action.payload.mode ?? "overview";
    },
    closeBillingDrawer() {
      return { ...initialState };
    },
    setBillingMode(state, action: PayloadAction<BillingDrawerMode>) {
      state.mode = action.payload;
    }
  }
});

export const { openBillingDrawer, closeBillingDrawer, setBillingMode } = billingSlice.actions;
export const billingReducer = billingSlice.reducer;