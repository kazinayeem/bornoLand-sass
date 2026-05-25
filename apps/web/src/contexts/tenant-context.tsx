"use client";

import { createContext, useContext, type ReactNode } from "react";

type ThemeData = {
  primaryColor: string; secondaryColor: string; font: string;
  buttonStyle: string; layoutWidth: string; darkMode: boolean; navbarStyle: string;
};

type ProductData = {
  _id: string; storeId: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; status: "active" | "inactive";
  sku: string; images: string[]; featured: boolean;
  createdAt: string; updatedAt: string;
};

type StoreData = {
  _id: string; name: string; slug: string; subdomain: string;
  description: string; theme: ThemeData; logoUrl?: string;
  selectedTemplateId?: Record<string, unknown>;
};

type TenantContextType = {
  store: StoreData;
  products: ProductData[];
  theme: ThemeData;
};

const TenantContext = createContext<TenantContextType | null>(null);

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}

export function TenantProvider({ value, children }: { value: TenantContextType; children: ReactNode }) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
