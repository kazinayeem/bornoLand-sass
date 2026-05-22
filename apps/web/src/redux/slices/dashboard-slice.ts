import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type DashboardState = {
  activeWorkspaceTab: "overview" | "pages" | "analytics" | "billing";
};

const initialState: DashboardState = {
  activeWorkspaceTab: "overview"
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setActiveWorkspaceTab(state, action: PayloadAction<DashboardState["activeWorkspaceTab"]>) {
      state.activeWorkspaceTab = action.payload;
    }
  }
});

export const { setActiveWorkspaceTab } = dashboardSlice.actions;
export const dashboardReducer = dashboardSlice.reducer;
