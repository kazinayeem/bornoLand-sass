import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "bornoland_current_store";

type CurrentStoreState = {
  storeId: string;
  storeName: string;
  storeSlug: string;
  initialized: boolean;
};

function loadFromStorage(): Omit<CurrentStoreState, "initialized"> {
  if (typeof window === "undefined") return { storeId: "", storeName: "", storeSlug: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        storeId: parsed.storeId ?? "",
        storeName: parsed.storeName ?? "",
        storeSlug: parsed.storeSlug ?? "",
      };
    }
  } catch {}
  return { storeId: "", storeName: "", storeSlug: "" };
}

function saveToStorage(state: Omit<CurrentStoreState, "initialized">) {
  if (typeof window === "undefined") return;
  try {
    if (state.storeId) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}

const persisted = loadFromStorage();

const initialState: CurrentStoreState = {
  ...persisted,
  initialized: false,
};

const currentStoreSlice = createSlice({
  name: "currentStore",
  initialState,
  reducers: {
    setCurrentStore(
      state,
      action: PayloadAction<{ storeId: string; storeName: string; storeSlug: string }>
    ) {
      state.storeId = action.payload.storeId;
      state.storeName = action.payload.storeName;
      state.storeSlug = action.payload.storeSlug;
      state.initialized = true;
      saveToStorage(action.payload);
    },
    clearCurrentStore(state) {
      state.storeId = "";
      state.storeName = "";
      state.storeSlug = "";
      state.initialized = true;
      saveToStorage({ storeId: "", storeName: "", storeSlug: "" });
    },
    rehydrateCurrentStore(state) {
      const stored = loadFromStorage();
      state.storeId = stored.storeId;
      state.storeName = stored.storeName;
      state.storeSlug = stored.storeSlug;
      state.initialized = true;
    },
  },
});

export const { setCurrentStore, clearCurrentStore, rehydrateCurrentStore } =
  currentStoreSlice.actions;
export const currentStoreReducer = currentStoreSlice.reducer;
