"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ThemeData = {
  primaryColor: string; secondaryColor: string; font: string;
  buttonStyle: string; layoutWidth: string; darkMode: boolean; navbarStyle: string;
};

export type StoreData = {
  _id: string; name: string; slug: string; subdomain: string;
  description: string; theme: ThemeData; logoUrl?: string;
};

export type ProductData = {
  _id: string; storeId: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; status: "active" | "inactive";
  sku: string; images: string[]; featured: boolean;
  createdAt: string; updatedAt: string;
};

export type TenantContextType = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
};

const TenantContext = createContext<TenantContextType | null>(null);

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    return {
      store: { _id: "", name: "Store", slug: "", subdomain: "", description: "", theme: { primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" } },
      theme: { primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter", buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed" },
      products: []
    };
  }
  return ctx;
}

export function TenantProvider({ value, children }: { value: TenantContextType; children: ReactNode }) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
