import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { THEME_PRESETS, type PresetKey } from "@/lib/design-system/theme-presets";

export type ThemeSettings = {
  preset?: PresetKey;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
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
  preset: "modern",
  primaryColor: "#2563eb",
  secondaryColor: "#0f172a",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#18181b",
  mutedTextColor: "#71717a",
  borderColor: "#e4e4e7",
  font: "Inter",
  buttonStyle: "rounded-xl",
  layoutWidth: "1280px",
  darkMode: false,
  navbarStyle: "fixed",
  headingFont: "Inter",
  bodyFont: "Inter",
  borderRadius: 14,
  shadowSize: "md",
  spacing: 20,
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
    applyPreset(state, action: PayloadAction<PresetKey>) {
      const presetConfig = THEME_PRESETS[action.payload];
      if (presetConfig) {
        state.preset = action.payload;
        state.primaryColor = presetConfig.primaryColor;
        state.secondaryColor = presetConfig.secondaryColor;
        state.accentColor = presetConfig.accentColor;
        state.backgroundColor = presetConfig.backgroundColor;
        state.textColor = presetConfig.textColor;
        state.mutedTextColor = presetConfig.mutedTextColor;
        state.borderColor = presetConfig.borderColor;
        state.font = presetConfig.font;
        state.headingFont = presetConfig.headingFont;
        state.bodyFont = presetConfig.bodyFont;
        state.buttonStyle = presetConfig.buttonStyle;
        state.layoutWidth = presetConfig.layoutWidth;
        state.borderRadius = presetConfig.borderRadius;
        state.shadowSize = presetConfig.shadowSize;
        state.spacing = presetConfig.spacing;
        state.productCardStyle = presetConfig.productCardStyle;
        state.gridColumns = presetConfig.gridColumns;
        state.heroHeight = presetConfig.heroHeight;
      }
    },
    setPrimaryColor(state, action: PayloadAction<string>) {
      state.primaryColor = action.payload;
    },
    setSecondaryColor(state, action: PayloadAction<string>) {
      state.secondaryColor = action.payload;
    },
    setAccentColor(state, action: PayloadAction<string>) {
      state.accentColor = action.payload;
    },
    setBackgroundColor(state, action: PayloadAction<string>) {
      state.backgroundColor = action.payload;
    },
    setTextColor(state, action: PayloadAction<string>) {
      state.textColor = action.payload;
    },
    setMutedTextColor(state, action: PayloadAction<string>) {
      state.mutedTextColor = action.payload;
    },
    setBorderColor(state, action: PayloadAction<string>) {
      state.borderColor = action.payload;
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
  setTheme, resetTheme, applyPreset,
  setPrimaryColor, setSecondaryColor, setAccentColor,
  setBackgroundColor, setTextColor, setMutedTextColor, setBorderColor,
  setFont, setDarkMode,
  setButtonStyle, setLayoutWidth, setNavbarStyle,
  setBorderRadius, setShadowSize, setSpacing,
  setProductCardStyle, setGridColumns, setShowBadges, setShowRatings,
  setHeroHeight,
} = themeSlice.actions;
export const themeReducer = themeSlice.reducer;

