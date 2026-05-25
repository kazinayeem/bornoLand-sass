import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Store } from "@/redux/api/store-api";

type StoreState = {
  selectedStore: Store | null;
  managementDrawerStoreId: string | null;
};

const initialState: StoreState = {
  selectedStore: null,
  managementDrawerStoreId: null
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    setSelectedStore(state, action: PayloadAction<Store | null>) {
      state.selectedStore = action.payload;
    },
    setManagementDrawerStoreId(state, action: PayloadAction<string | null>) {
      state.managementDrawerStoreId = action.payload;
    },
    clearStoreState() {
      return { ...initialState };
    }
  }
});

export const { setSelectedStore, setManagementDrawerStoreId, clearStoreState } = storeSlice.actions;
export const storeReducer = storeSlice.reducer;