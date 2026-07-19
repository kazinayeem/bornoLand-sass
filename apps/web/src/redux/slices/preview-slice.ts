import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PreviewState = {
  device: "desktop" | "laptop" | "tablet" | "mobile";
  zoom: number;
  showGuides: boolean;
  showGrid: boolean;
  fullscreen: boolean;
  presentationMode: boolean;
};

const initialState: PreviewState = {
  device: "desktop",
  zoom: 100,
  showGuides: false,
  showGrid: false,
  fullscreen: false,
  presentationMode: false,
};

const previewSlice = createSlice({
  name: "preview",
  initialState,
  reducers: {
    setDevice(state, action: PayloadAction<PreviewState["device"]>) {
      state.device = action.payload;
    },
    setZoom(state, action: PayloadAction<number>) {
      // Builder-only zoom. This never reaches the storefront theme or published CSS.
      state.zoom = Math.max(25, Math.min(400, action.payload));
    },
    toggleGuides(state) {
      state.showGuides = !state.showGuides;
    },
    toggleGrid(state) {
      state.showGrid = !state.showGrid;
    },
    setFullscreen(state, action: PayloadAction<boolean>) {
      state.fullscreen = action.payload;
      if (action.payload) state.presentationMode = false;
    },
    setPresentationMode(state, action: PayloadAction<boolean>) {
      state.presentationMode = action.payload;
      if (action.payload) state.fullscreen = false;
    },
  },
});

export const { setDevice, setZoom, toggleGuides, toggleGrid, setFullscreen, setPresentationMode } = previewSlice.actions;
export const previewReducer = previewSlice.reducer;
