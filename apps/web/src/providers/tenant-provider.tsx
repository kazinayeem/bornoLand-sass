"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { setStoreSettings } from "@/redux/slices/store-settings-slice";
import type { StoreContact } from "@/redux/api/store-contact-api";

export type ThemeData = {
  primaryColor: string; secondaryColor: string; font: string;
  buttonStyle: string; layoutWidth: string; darkMode: boolean; navbarStyle: string;
};

export type StoreData = {
  _id: string; name: string; slug: string; subdomain: string;
  description: string; theme: ThemeData; logoUrl?: string;
  shortName?: string; tagline?: string; faviconUrl?: string;
};

export type ProductData = {
  _id: string; storeId: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; status: "active" | "inactive" | "draft" | "archived";
  sku: string; imageUrl?: string; thumbnailUrl?: string; galleryImageUrls?: string[]; images: string[]; featured: boolean;
  categoryIds?: string[];
  createdAt: string; updatedAt: string;
};

export type CategoryData = {
  _id: string; storeId: string; name: string; slug: string;
  imageUrl: string; description: string; parentId: string | null;
  active: boolean; featured: boolean; sortOrder: number;
  createdAt?: string; updatedAt?: string;
};

export type StoreSettingsData = {
  currencyCode: "USD" | "BDT" | "EUR" | "GBP" | "INR";
  currencySymbol: string;
  currencyPosition: "before" | "after";
  locale: string;
  decimalPlaces: number;
  taxRate: number;
  taxEnabled?: boolean;
  taxIncluded?: boolean;
  dateFormat?: string;
  timezone?: string;
  language?: string;
  shippingEnabled?: boolean;
  freeShippingEnabled?: boolean;
  freeShippingMin?: number;
  guestCheckoutEnabled?: boolean;
  requireLoginEnabled?: boolean;
  minimumOrderAmount?: number;
  paymentSettings?: {
    codEnabled?: boolean;
    bkash?: { enabled?: boolean; number?: string; type?: string; instructions?: string };
    nagad?: { enabled?: boolean; number?: string; type?: string; instructions?: string };
  };
  deliveryZones?: Array<{
    id: string;
    name: string;
    charge: number;
    estimatedDays?: string;
    enabled?: boolean;
  }>;
};


export type HomepageSliderData = {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: number;
  isActive: boolean;
  overlayColor: string;
  textAlignment: "left" | "center" | "right";
};

export type NavigationItemData = {
  _id: string;
  title: string;
  link?: string;
  icon?: string;
  badge?: string;
  linkType?: "custom" | "page" | "collection" | "category" | "product" | "blog" | "external";
  referenceId?: string;
  target?: "_self" | "_blank";
  isExternal?: boolean;
  openInNewTab?: boolean;
  authRequired?: boolean;
  isVisible?: boolean;
  hideOnDesktop?: boolean;
  hideOnMobile?: boolean;
  children?: NavigationItemData[];
};

export type NavigationData = {
  _id: string;
  key: "primary" | "footer" | "mobile" | "top_bar" | "account" | "sidebar";
  label: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  items?: NavigationItemData[];
};

export type TenantContextType = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  navigations: NavigationData[];
  contact: StoreContact | null;
};

const TenantContext = createContext<TenantContextType | null>(null);

export function useTenant(): TenantContextType {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    return {
      store: { _id: "", name: "Store", slug: "", subdomain: "", description: "", logoUrl: "", theme: { primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" } },
      theme: { primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
      products: [],
      categories: [],
      settings: { currencyCode: "USD", currencySymbol: "$", currencyPosition: "before", locale: "en-US", decimalPlaces: 2, taxRate: 0, taxEnabled: false, taxIncluded: false },
      sliders: [],
      navigations: [],
      contact: null,
    } satisfies TenantContextType;
  }
  return ctx;
}

function TenantSync({ settings }: { settings: StoreSettingsData }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setStoreSettings({
      currencyCode: settings.currencyCode,
      currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition,
      locale: settings.locale,
      decimalPlaces: settings.decimalPlaces,
      taxRate: settings.taxRate,
      taxEnabled: settings.taxEnabled ?? false,
      taxIncluded: settings.taxIncluded ?? false,
      dateFormat: settings.dateFormat,
      timezone: settings.timezone,
      language: settings.language,
    }));
  }, [dispatch, settings.currencyCode, settings.currencySymbol, settings.currencyPosition, settings.locale, settings.decimalPlaces, settings.taxRate, settings.taxEnabled, settings.taxIncluded, settings.dateFormat, settings.timezone, settings.language]);
  return null;
}

export function TenantProvider({ value, children }: { value: TenantContextType; children: ReactNode }) {
  return (
    <TenantContext.Provider value={value}>
      <TenantSync settings={value.settings} />
      {children}
    </TenantContext.Provider>
  );
}
