import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type TenantState = {
  tenantId: string | null;
  tenantSlug: string | null;
};

const initialState: TenantState = {
  tenantId: null,
  tenantSlug: null
};

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setTenantContext(state, action: PayloadAction<{ tenantId: string | null; tenantSlug?: string | null }>) {
      state.tenantId = action.payload.tenantId;
      state.tenantSlug = action.payload.tenantSlug ?? null;
    },
    clearTenantContext(state) {
      state.tenantId = null;
      state.tenantSlug = null;
    }
  }
});

export const { setTenantContext, clearTenantContext } = tenantSlice.actions;
export const tenantReducer = tenantSlice.reducer;
