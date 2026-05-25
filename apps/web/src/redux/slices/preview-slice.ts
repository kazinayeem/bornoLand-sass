import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PreviewState = {
  device: "desktop" | "tablet" | "mobile";
  zoom: number;
  showGuides: boolean;
  showGrid: boolean;
};

const initialState: PreviewState = {
  device: "desktop",
  zoom: 100,
  showGuides: false,
  showGrid: false,
};

const previewSlice = createSlice({
  name: "preview",
  initialState,
  reducers: {
    setDevice(state, action: PayloadAction<PreviewState["device"]>) {
      state.device = action.payload;
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = Math.max(25, Math.min(200, action.payload));
    },
    toggleGuides(state) {
      state.showGuides = !state.showGuides;
    },
    toggleGrid(state) {
      state.showGrid = !state.showGrid;
    },
  },
});

export const { setDevice, setZoom, toggleGuides, toggleGrid } = previewSlice.actions;
export const previewReducer = previewSlice.reducer;
