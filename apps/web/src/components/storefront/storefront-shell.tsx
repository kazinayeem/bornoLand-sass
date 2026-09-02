"use client";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import { AuthInit } from "@/components/auth/auth-init";
import { CartProvider } from "@/components/storefront/cart-provider";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { generateThemeCssVariables } from "@/lib/design-system/theme-presets";
import { ThemeProvider } from "@/components/store/theme-provider";
import { ThemeHeader } from "@/components/store/theme-header";
import { ThemeFooter } from "@/components/store/theme-footer";


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
import { getStoreLogoUrl } from "@/lib/store-branding";
import { normalizeStoreId } from "@/hooks/use-store-categories";
import type { StorefrontSectionLike } from "@/components/storefront/storefront-types";
import {
  StorefrontHeaderOffsetProvider,
  StorefrontHeaderSettingsProvider,
} from "@/components/storefront/storefront-header-offset";
import type { PublicStoreTracking } from "@/lib/tracking/types";
import { StorefrontTracker } from "@/components/tracking/storefront-tracker";

export type StorefrontShellProps = {
  store: StoreData;
  theme: ThemeData;
  products: ProductData[];
  categories: CategoryData[];
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  navigations?: NavigationData[];
  contact?: StoreContact | null;
  tracking?: PublicStoreTracking | null;
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

export function StorefrontShell({
  store,
  theme,
  products,
  categories,
  settings,
  sliders,
  navigations = [],
  contact = null,
  tracking = null,
  headerSettings,
  footerSettings: footerSettings,
  showAdminBar = false,
  builderMode = false,
  children,
}: StorefrontShellProps) {
  const themeCssVars = useMemo(() => generateThemeCssVariables({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    accentColor: (theme as any).accentColor,
    backgroundColor: (theme as any).backgroundColor,
    textColor: (theme as any).textColor,
    mutedTextColor: (theme as any).mutedTextColor,
    borderColor: (theme as any).borderColor,
    borderRadius: (theme as any).borderRadius ?? 8,
    shadowSize: (theme as any).shadowSize ?? "md",
    layoutWidth: theme.layoutWidth,
    font: theme.font,
    headingFont: (theme as any).headingFont,
    bodyFont: (theme as any).bodyFont,
  }), [theme]);
  const storeWithBranding = useMemo(
    () => ({
      ...store,
      _id: normalizeStoreId(store._id) || store._id,
      logoUrl: getStoreLogoUrl({ logoUrl: store.logoUrl ?? "" }) || store.logoUrl || "",
    }),
    [store],
  );
  const tenantValue = useMemo<TenantContextType>(
    () => ({
      store: storeWithBranding,
      theme,
      products,
      // Categories are loaded live via useStoreCategories() — never SSR seed/ISR cache.
      categories: [],
      settings,
      sliders,
      navigations,
      contact,
      tracking,
    }),
    [storeWithBranding, theme, products, settings, sliders, navigations, contact, tracking],
  );

  const shellContent = (
    <StorefrontHeaderOffsetProvider>
      <StorefrontHeaderSettingsProvider settings={headerSettings}>
        <div
          data-surface="storefront"
          data-builder-preview={builderMode ? "true" : undefined}
          className={`min-h-screen w-full max-w-full min-w-0 antialiased ${builderMode ? "" : theme.darkMode ? "dark bg-zinc-950 text-white" : "bg-white text-zinc-900"}`}
          style={{
            fontFamily: theme.font || "Inter, sans-serif",
            ...themeCssVars,
          } as React.CSSProperties}
        >
          <StorefrontTracker storeId={store._id} tracking={tracking} builderMode={builderMode} />
          <TenantProvider value={tenantValue}>
            <AuthInit />
            <ThemeProvider themeId={(theme as any)?.themeId || (store.theme as any)?.themeId || "grocery"}>
              {/* Single, authoritative Global Header pipeline — same for builder + storefront.
                  Header stays OUTSIDE main overflow so position:sticky is not broken by clip. */}
              <ThemeHeader headerSettings={headerSettings} />

              <CartProvider>
                <CartDrawer primaryColor={theme.primaryColor} />
                <main className="relative w-full max-w-full min-w-0 flex-1 overflow-x-clip">
                  {children}
                </main>
              </CartProvider>

              {/* Single, authoritative Global Footer pipeline */}
              <ThemeFooter footerSettings={footerSettings} />

              {showAdminBar ? (
                <FloatingAdminBar storeSlug={store.slug} primaryColor={theme.primaryColor} />
              ) : null}
            </ThemeProvider>
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
