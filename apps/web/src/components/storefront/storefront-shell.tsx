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
import { generateThemeCssVariables } from "@/lib/design-system/theme-presets";

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
  NavigationData,
} from "@/providers/tenant-provider";
import type { StoreContact } from "@/redux/api/store-contact-api";
import { TenantProvider } from "@/providers/tenant-provider";
import { StorefrontDeviceProvider } from "@/lib/device-context";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import {
  StorefrontHeaderOffsetProvider,
  StorefrontHeaderSettingsProvider,
} from "@/components/storefront/storefront-header-offset";

export type StorefrontShellProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  navigations?: NavigationData[];
  contact?: StoreContact | null;
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
  navigations = [],
  contact = null,
  pageSections,
  headerSections,
  footerSections,
  footerSection,
  headerSettings,
  footerSettings: footerSettings,
  navLinksOverride,
  showAdminBar = false,
  builderMode = false,
  children,
}: StorefrontShellProps) {
  const themeCssVars = useMemo(() => generateThemeCssVariables(theme), [theme]);
  const tenantValue = useMemo<TenantContextType>(
    () => ({ store, theme, products, categories, settings, sliders, navigations, contact }),
    [store._id, store.slug, theme, products, categories, settings, sliders, navigations, contact],
  );

  const hasBuilderHeader = Boolean(headerSections && headerSections.length > 0);
  const hasBuilderFooter = Boolean(footerSections && footerSections.length > 0);

  const visibleHeaderSections = hasBuilderHeader
    ? (headerSections ?? []).filter((s) => s.visible !== false)
    : [];
  const visibleFooterSections = hasBuilderFooter
    ? (footerSections ?? []).filter((s) => s.visible !== false)
    : [];

  const shellContent = (
    <StorefrontHeaderOffsetProvider>
      <StorefrontHeaderSettingsProvider settings={headerSettings}>
        <div
          data-surface={builderMode ? undefined : "storefront"}
          className={`min-h-screen w-full overflow-x-hidden antialiased ${builderMode ? "" : theme.darkMode ? "dark bg-zinc-950 text-white" : "bg-white text-zinc-900"}`}
          style={{
            fontFamily: theme.font || "Inter, sans-serif",
            ...themeCssVars,
          } as React.CSSProperties}
        >


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
              <StoreNavbar navLinksOverride={navLinksOverride} headerSettings={headerSettings} />
            )}
            <CartProvider>
              <CartDrawer primaryColor={theme.primaryColor} />
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
              <StoreFooter
                section={footerSection ?? undefined}
                footerSections={footerSections}
                footerSettings={footerSettings}
              />
            )}
            {showAdminBar ? (
              <FloatingAdminBar storeSlug={store.slug} primaryColor={theme.primaryColor} />
            ) : null}
          </TenantProvider>
        </div>
      </StorefrontHeaderSettingsProvider>
    </StorefrontHeaderOffsetProvider>
  );

  // In builder mode, skip StorefrontDeviceProvider so the outer
  // BuilderDeviceProvider (isBuilder: true, device from Redux) flows through.
  // In live mode, wrap with StorefrontDeviceProvider for auto-detected device.
  if (builderMode) return shellContent;
  return <StorefrontDeviceProvider>{shellContent}</StorefrontDeviceProvider>;
}
