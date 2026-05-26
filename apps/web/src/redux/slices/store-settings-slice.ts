import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CurrencyCode = "USD" | "BDT" | "EUR" | "INR";

export type StoreSettingsState = {
  currencyCode: CurrencyCode;
  currencySymbol: string;
  currencyPosition: "before" | "after";
  locale: string;
  decimalPlaces: number;
  dateFormat: string;
  timezone: string;
  language: string;
};

const initialState: StoreSettingsState = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "before",
  locale: "en-US",
  decimalPlaces: 2,
  dateFormat: "MM/DD/YYYY",
  timezone: "UTC",
  language: "en",
};

const storeSettingsSlice = createSlice({
  name: "storeSettings",
  initialState,
  reducers: {
    setStoreSettings(state, action: PayloadAction<Partial<StoreSettingsState>>) {
      if (action.payload.currencyCode !== undefined) state.currencyCode = action.payload.currencyCode;
      if (action.payload.currencySymbol !== undefined) state.currencySymbol = action.payload.currencySymbol;
      if (action.payload.currencyPosition !== undefined) state.currencyPosition = action.payload.currencyPosition;
      if (action.payload.locale !== undefined) state.locale = action.payload.locale;
      if (action.payload.decimalPlaces !== undefined) state.decimalPlaces = action.payload.decimalPlaces;
      if (action.payload.dateFormat !== undefined) state.dateFormat = action.payload.dateFormat;
      if (action.payload.timezone !== undefined) state.timezone = action.payload.timezone;
      if (action.payload.language !== undefined) state.language = action.payload.language;
    },
    resetStoreSettings() {
      return initialState;
    },
  },
});

export const { setStoreSettings, resetStoreSettings } = storeSettingsSlice.actions;
export default storeSettingsSlice.reducer;
