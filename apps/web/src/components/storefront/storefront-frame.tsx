import type { ReactNode } from "react";
import { AuthInit } from "@/components/auth/auth-init";
import { CartProvider } from "@/components/storefront/cart-provider";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import type { CategoryData, HomepageSliderData, ProductData, StoreData, StoreSettingsData, ThemeData } from "@/providers/tenant-provider";
import { TenantProvider } from "@/providers/tenant-provider";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";

type StorefrontFrameProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  pageSections: StorefrontSectionLike[];
  footerSection?: StorefrontSectionLike | null;
  adminBarStoreId?: string;
  showAdminBar?: boolean;
  children: ReactNode;
};

export function StorefrontFrame({
  store,
  theme,
  products,
  categories,
  settings,
  sliders,
  pageSections,
  footerSection,
  adminBarStoreId,
  showAdminBar = false,
  children,
}: StorefrontFrameProps) {
  return (
    <div style={{ fontFamily: theme.font, backgroundColor: theme.darkMode ? "#000000" : "#ffffff" }}>
      <TenantProvider value={{ store, theme, products, categories, settings, sliders, pageSections }}>
        <AuthInit />
        <StoreNavbar />
        <CartProvider>
          {children}
        </CartProvider>
        <StoreFooter section={footerSection ?? undefined} />
        {showAdminBar && adminBarStoreId ? (
          <FloatingAdminBar storeSlug={store.slug} primaryColor={theme.primaryColor} />
        ) : null}
      </TenantProvider>
    </div>
  );
}