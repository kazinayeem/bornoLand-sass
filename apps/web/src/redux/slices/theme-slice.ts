import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  font: string;
  buttonStyle: string;
  layoutWidth: string;
  darkMode: boolean;
  navbarStyle: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: number;
  shadowSize: "none" | "sm" | "md" | "lg";
  spacing: number;
  productCardStyle: "default" | "minimal" | "bordered" | "elevated";
  gridColumns: number;
  showBadges: boolean;
  showRatings: boolean;
  heroHeight: "sm" | "md" | "lg";
};

const initialState: ThemeSettings = {
  primaryColor: "#2563eb",
  secondaryColor: "#0f172a",
  font: "Inter",
  buttonStyle: "rounded-lg",
  layoutWidth: "1200px",
  darkMode: false,
  navbarStyle: "fixed",
  headingFont: "Inter",
  bodyFont: "Inter",
  borderRadius: 12,
  shadowSize: "md",
  spacing: 16,
  productCardStyle: "default",
  gridColumns: 4,
  showBadges: true,
  showRatings: true,
  heroHeight: "md",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Partial<ThemeSettings>>) {
      return { ...state, ...action.payload };
    },
    resetTheme() {
      return { ...initialState };
    },
    setPrimaryColor(state, action: PayloadAction<string>) {
      state.primaryColor = action.payload;
    },
    setSecondaryColor(state, action: PayloadAction<string>) {
      state.secondaryColor = action.payload;
    },
    setFont(state, action: PayloadAction<string>) {
      state.font = action.payload;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },
    setButtonStyle(state, action: PayloadAction<string>) {
      state.buttonStyle = action.payload;
    },
    setLayoutWidth(state, action: PayloadAction<string>) {
      state.layoutWidth = action.payload;
    },
    setNavbarStyle(state, action: PayloadAction<string>) {
      state.navbarStyle = action.payload;
    },
    setBorderRadius(state, action: PayloadAction<number>) {
      state.borderRadius = action.payload;
    },
    setShadowSize(state, action: PayloadAction<ThemeSettings["shadowSize"]>) {
      state.shadowSize = action.payload;
    },
    setSpacing(state, action: PayloadAction<number>) {
      state.spacing = action.payload;
    },
    setProductCardStyle(state, action: PayloadAction<ThemeSettings["productCardStyle"]>) {
      state.productCardStyle = action.payload;
    },
    setGridColumns(state, action: PayloadAction<number>) {
      state.gridColumns = action.payload;
    },
    setShowBadges(state, action: PayloadAction<boolean>) {
      state.showBadges = action.payload;
    },
    setShowRatings(state, action: PayloadAction<boolean>) {
      state.showRatings = action.payload;
    },
    setHeroHeight(state, action: PayloadAction<ThemeSettings["heroHeight"]>) {
      state.heroHeight = action.payload;
    },
  },
});

export const {
  setTheme, resetTheme,
  setPrimaryColor, setSecondaryColor, setFont, setDarkMode,
  setButtonStyle, setLayoutWidth, setNavbarStyle,
  setBorderRadius, setShadowSize, setSpacing,
  setProductCardStyle, setGridColumns, setShowBadges, setShowRatings,
  setHeroHeight,
} = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
