"use client";

import { useMemo, type ReactNode } from "react";
import { AuthInit } from "@/components/auth/auth-init";
import { CartProvider } from "@/components/storefront/cart-provider";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import type {
  CategoryData,
  HomepageSliderData,
  ProductData,
  StoreData,
  StoreSettingsData,
  TenantContextType,
  ThemeData,
} from "@/providers/tenant-provider";
import { TenantProvider } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";

type StorefrontShellProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  pageSections: StorefrontSectionLike[];
  footerSection?: StorefrontSectionLike | null;
  showAdminBar?: boolean;
  children: ReactNode;
};

export function StorefrontShell({
  store,
  theme,
  products,
  categories,
  settings,
  sliders,
  pageSections,
  footerSection,
  showAdminBar = false,
  children,
}: StorefrontShellProps) {
  const tenantValue = useMemo<TenantContextType>(
    () => ({ store, theme, products, categories, settings, sliders, pageSections }),
    [store._id, store.slug, theme, products, categories, settings, sliders, pageSections],
  );

  return (
    <div style={{ fontFamily: theme.font, backgroundColor: theme.darkMode ? "#000000" : "#ffffff" }}>
      <TenantProvider value={tenantValue}>
        <AuthInit />
        <StoreNavbar />
        <CartProvider>
          {children}
        </CartProvider>
        <StoreFooter section={footerSection ?? undefined} />
        {showAdminBar ? (
          <FloatingAdminBar storeSlug={store.slug} primaryColor={theme.primaryColor} />
        ) : null}
      </TenantProvider>
    </div>
  );
}
