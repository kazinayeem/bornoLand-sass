"use client";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import { AuthInit } from "@/components/auth/auth-init";
import { CartProvider } from "@/components/storefront/cart-provider";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import { BuilderProvider } from "@/components/sections/builder-link";

const CartDrawer = dynamic(
  () => import("./cart-drawer").then((module) => module.CartDrawer),
  { loading: () => null }
);
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
import { StorefrontDeviceProvider } from "@/lib/device-context";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";

type StorefrontShellProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  pageSections: StorefrontSectionLike[];
  headerSections?: StorefrontSectionLike[];
  footerSections?: StorefrontSectionLike[];
  footerSection?: StorefrontSectionLike | null;
  headerSettings?: Record<string, unknown>;
  footerSettings?: Record<string, unknown>;
  navLinksOverride?: Array<{ name: string; href: string }>;
  showAdminBar?: boolean;
  builderMode?: boolean;
  children: ReactNode;
};

function toSectionData(s: StorefrontSectionLike): SectionData {
  const props: Record<string, string> = {};
  if (s.props) {
    for (const [key, value] of Object.entries(s.props)) {
      props[key] = value == null ? "" : String(value);
    }
  }
  return { id: s.id, type: s.type, visible: s.visible, props, style: s.style };
}

export function StorefrontShell({
  store,
  theme,
  products,
  categories,
  settings,
  sliders,
  pageSections,
  headerSections,
  footerSections,
  footerSection,
  headerSettings,
  footerSettings: _footerSettings,
  navLinksOverride,
  showAdminBar = false,
  builderMode = false,
  children,
}: StorefrontShellProps) {
  const tenantValue = useMemo<TenantContextType>(
    () => ({ store, theme, products, categories, settings, sliders, pageSections }),
    [store._id, store.slug, theme, products, categories, settings, sliders, pageSections],
  );

  const hasBuilderHeader = headerSections && headerSections.length > 0;
  const hasBuilderFooter = footerSections && footerSections.length > 0;

  const visibleHeaderSections = hasBuilderHeader
    ? headerSections.filter((s) => s.visible !== false)
    : [];
  const visibleFooterSections = hasBuilderFooter
    ? footerSections.filter((s) => s.visible !== false)
    : [];

  return (
    <StorefrontDeviceProvider>
    <div style={{ fontFamily: theme.font, backgroundColor: theme.darkMode ? "#000000" : "#ffffff" }}>
      <TenantProvider value={tenantValue}>
        <AuthInit />
        {hasBuilderHeader ? (
          <header>
            {builderMode ? (
              <BuilderProvider>
                {visibleHeaderSections.map((s) => (
                  <SectionRenderer key={s.id} section={toSectionData(s)} />
                ))}
              </BuilderProvider>
            ) : (
              visibleHeaderSections.map((s) => (
                <SectionRenderer key={s.id} section={toSectionData(s)} />
              ))
            )}
          </header>
        ) : (
          <StoreNavbar navLinksOverride={navLinksOverride} />
        )}
        {hasBuilderHeader && <CartDrawer primaryColor={theme.primaryColor} />}
        <CartProvider>
          {children}
        </CartProvider>
        {hasBuilderFooter ? (
          <footer>
            {builderMode ? (
              <BuilderProvider>
                {visibleFooterSections.map((s) => (
                  <SectionRenderer key={s.id} section={toSectionData(s)} />
                ))}
              </BuilderProvider>
            ) : (
              visibleFooterSections.map((s) => (
                <SectionRenderer key={s.id} section={toSectionData(s)} />
              ))
            )}
          </footer>
        ) : (
          <StoreFooter section={footerSection ?? undefined} footerSections={footerSections} />
        )}
        {showAdminBar ? (
          <FloatingAdminBar storeSlug={store.slug} primaryColor={theme.primaryColor} />
        ) : null}
      </TenantProvider>
    </div>
    </StorefrontDeviceProvider>
  );
}
