import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StoreLayout } from "@/components/storefront/store-layout";
import type {
  ThemeData,
  ProductData,
  CategoryData,
  StoreData,
  StoreSettingsData,
  HomepageSliderData,
  NavigationData,
} from "@/providers/tenant-provider";
import type { StoreContact } from "@/redux/api/store-contact-api";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { generateTenantLayoutMetadata } from "@/lib/server/page-metadata";
import { getThemeById } from "@/themes/registry";
import { StoreNotFoundView } from "@/components/storefront/store-not-found-view";

/** ISR — public storefront shell (store, theme, products, categories, navigation) */
export const revalidate = 60;

/** On-demand ISR: tenants generated on first visit; publish invalidates via cache tags */
export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params;
  return generateTenantLayoutMetadata(tenant);
}

import type { PublicStoreTracking } from "@/lib/tracking/types";

export default async function TenantLayout({ params, children }: { params: Promise<{ tenant: string }>; children: React.ReactNode }) {
  const { tenant: slug } = await params;
  const data = (await fetchTenantSite(slug)) as {
    store: StoreData | null;
    page: Record<string, unknown> | null;
    products: ProductData[];
    categories?: CategoryData[];
    settings?: StoreSettingsData | null;
    sliders?: HomepageSliderData[];
    navigations?: NavigationData[];
    contact?: StoreContact | null;
    tracking?: PublicStoreTracking | null;
  } | null;

  // Render dedicated Store Not Found page when store does not exist
  if (!data?.store) {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1") {
      console.log(`[site-layout] store missing for tenant="${slug}" → rendering StoreNotFoundView`);
    }
    return <StoreNotFoundView tenantSlug={slug} />;
  }

  const { store, products, settings, sliders } = data;
  const categories = data.categories ?? [];
  const navigations = data.navigations ?? [];
  const contact = data.contact ?? null;
  const storeWithBranding: StoreData = {
    ...store,
    shortName: (store as StoreData & { shortName?: string }).shortName,
    tagline: (store as StoreData & { tagline?: string }).tagline,
    faviconUrl: (store as StoreData & { faviconUrl?: string }).faviconUrl,
  };
  const pageSections = (data.page?.sections as { id: string; type: string; visible?: boolean; props?: Record<string, string> }[] | undefined) ?? [];
  const activeTheme = getThemeById(store.theme?.themeId || "grocery");
  const theme: ThemeData = {
    themeId: activeTheme.id,
    primaryColor: store.theme?.primaryColor || activeTheme.tokens.colors.primary,
    secondaryColor: store.theme?.secondaryColor || activeTheme.tokens.colors.secondary,
    accentColor: (store.theme as any)?.accentColor || activeTheme.tokens.colors.accent,
    backgroundColor: (store.theme as any)?.backgroundColor || activeTheme.tokens.colors.background,
    textColor: (store.theme as any)?.textColor || activeTheme.tokens.colors.text,
    mutedTextColor: (store.theme as any)?.mutedTextColor || activeTheme.tokens.colors.textMuted,
    borderColor: (store.theme as any)?.borderColor || activeTheme.tokens.colors.border,
    font: store.theme?.font || activeTheme.tokens.typography.fontFamily,
    buttonStyle: store.theme?.buttonStyle || "rounded-lg",
    layoutWidth: store.theme?.layoutWidth || activeTheme.tokens.layout.containerWidth || "1280px",
    darkMode: store.theme?.darkMode || false,
    navbarStyle: store.theme?.navbarStyle || "sticky",
  };
  const currencySettings = settings ?? {
    currencyCode: "USD",
    currencySymbol: "$",
    currencyPosition: "before",
    locale: "en-US",
    decimalPlaces: 2,
    taxRate: 0,
    dateFormat: "MM/DD/YYYY",
    timezone: "UTC",
    language: "en",
  };
  const footerSection = pageSections.find((section) => section.type === "footer") ?? null;
  const headerSections = (data.page?.headerSections as any[]) ?? [];
  const footerSections = (data.page?.footerSections as any[]) ?? [];
  const headerSettings = (data.page?.headerSettings as Record<string, unknown>) ?? {};
  const footerSettings = (data.page?.footerSettings as Record<string, unknown>) ?? {};

  return (
    <StoreLayout
      store={storeWithBranding}
      theme={theme}
      products={products}
      categories={categories}
      settings={currencySettings}
      sliders={sliders ?? []}
      navigations={navigations}
      contact={contact}
      tracking={data?.tracking ?? null}
      pageSections={pageSections}
      headerSections={headerSections}
      footerSections={footerSections}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      footerSection={footerSection}
      showAdminBar={false}
    >
      {children}
    </StoreLayout>
  );
}
