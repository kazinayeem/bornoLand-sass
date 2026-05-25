import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CustomerData = {
  _id: string;
  name: string;
  email: string;
  storeId: string;
};

type CustomerState = {
  customer: CustomerData | null;
  token: string | null;
  isAuthenticated: boolean;
  restored: boolean;
};

const initialState: CustomerState = {
  customer: null,
  token: null,
  isAuthenticated: false,
  restored: false,
};

function decodeToken(token: string): CustomerData | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      _id: payload.customerId ?? "",
      name: payload.name ?? payload.email?.split("@")[0] ?? "Customer",
      email: payload.email ?? "",
      storeId: payload.storeId ?? "",
    };
  } catch {
    return null;
  }
}

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomer(state, action: PayloadAction<{ customer: CustomerData; token: string }>) {
      state.customer = action.payload.customer;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.restored = true;
    },
    setCustomerFromToken(state, action: PayloadAction<string>) {
      const customer = decodeToken(action.payload);
      if (customer) {
        state.customer = customer;
        state.token = action.payload;
        state.isAuthenticated = true;
      }
      state.restored = true;
    },
    clearCustomer(state) {
      state.customer = null;
      state.token = null;
      state.isAuthenticated = false;
      state.restored = true;
    },
    setRestored(state) {
      state.restored = true;
    },
  },
});

export const { setCustomer, setCustomerFromToken, clearCustomer, setRestored } = customerSlice.actions;
export const customerReducer = customerSlice.reducer;
