import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Store } from "@/redux/api/store-api";

type StoresState = {
  stores: Store[];
  selectedStore: Store | null;
  loading: boolean;
};

const initialState: StoresState = {
  stores: [],
  selectedStore: null,
  loading: false
};

const storesSlice = createSlice({
  name: "stores",
  initialState,
  reducers: {
    setStores(state, action: PayloadAction<Store[]>) {
      state.stores = action.payload;
    },
    setSelectedStore(state, action: PayloadAction<Store | null>) {
      state.selectedStore = action.payload;
    },
    addStore(state, action: PayloadAction<Store>) {
      state.stores.unshift(action.payload);
    },
    removeStore(state, action: PayloadAction<string>) {
      state.stores = state.stores.filter((s) => s._id !== action.payload);
    },
    updateStoreInList(state, action: PayloadAction<Store>) {
      const idx = state.stores.findIndex((s) => s._id === action.payload._id);
      if (idx !== -1) state.stores[idx] = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    }
  }
});

export const { setStores, setSelectedStore, addStore, removeStore, updateStoreInList, setLoading } = storesSlice.actions;
export const storesReducer = storesSlice.reducer;
