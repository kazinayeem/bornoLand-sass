import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
};

const initialState: UiState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.mobileSidebarOpen = action.payload;
    },
    toggleMobileSidebar(state) {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
  },
});

export const {
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  setMobileSidebarOpen,
  toggleMobileSidebar,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
