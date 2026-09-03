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
  try {
    console.log(`[store-render-debug] stage="GENERATE_METADATA_START" tenant="${tenant}"`);
    const meta = await generateTenantLayoutMetadata(tenant);
    console.log(`[store-render-debug] stage="GENERATE_METADATA_SUCCESS" tenant="${tenant}"`);
    return meta;
  } catch (error: any) {
    console.error(`[store-render-error] stage="generateMetadata" tenant="${tenant}":`, error?.message);
    if (error?.stack) console.error(`[store-render-error] stack:`, error.stack);
    throw error;
  }
}

import type { PublicStoreTracking } from "@/lib/tracking/types";

export default async function TenantLayout({ params, children }: { params: Promise<{ tenant: string }>; children: React.ReactNode }) {
  const { tenant: slug } = await params;
  let data: {
    store: StoreData | null;
    page: Record<string, unknown> | null;
    products: ProductData[];
    categories?: CategoryData[];
    settings?: StoreSettingsData | null;
    sliders?: HomepageSliderData[];
    navigations?: NavigationData[];
    contact?: StoreContact | null;
    tracking?: PublicStoreTracking | null;
  } | null = null;

  try {
    data = (await fetchTenantSite(slug)) as any;
    console.log(`[store-render-debug] FETCH_SUCCESS tenant="${slug}" hasStore=${Boolean(data?.store)}`);
  } catch (err: any) {
    console.error(`[store-render-error] stage="FETCH" tenant="${slug}":`, err?.message);
    if (err?.stack) console.error(`[store-render-error] stack:`, err.stack);
    throw err;
  }

  // Render dedicated Store Not Found page when store does not exist (HTTP 404)
  if (!data?.store) {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1") {
      console.log(`[site-layout] store missing for tenant="${slug}" → triggering notFound()`);
    }
    notFound();
  }

  let storeWithBranding: StoreData;
  let theme: ThemeData;
  let currencySettings: StoreSettingsData;

  try {
    const { store, settings } = data;
    storeWithBranding = {
      ...store,
      shortName: (store as StoreData & { shortName?: string }).shortName,
      tagline: (store as StoreData & { tagline?: string }).tagline,
      faviconUrl: (store as StoreData & { faviconUrl?: string }).faviconUrl,
    };
    const activeTheme = getThemeById(store.theme?.themeId || "grocery");
    theme = {
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
    currencySettings = settings ?? {
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
    console.log(`[store-render-debug] STORE_NORMALIZED tenant="${slug}" themeId="${theme.themeId}"`);
  } catch (err: any) {
    console.error(`[store-render-error] stage="STORE_NORMALIZED" tenant="${slug}":`, err?.message);
    if (err?.stack) console.error(`[store-render-error] stack:`, err.stack);
    throw err;
  }

  let pageSections: any[];
  let headerSections: any[];
  let footerSections: any[];
  let headerSettings: Record<string, unknown>;
  let footerSettings: Record<string, unknown>;
  let footerSection: any;

  try {
    pageSections = (data.page?.sections as { id: string; type: string; visible?: boolean; props?: Record<string, string> }[] | undefined) ?? [];
    footerSection = pageSections.find((section: any) => section.type === "footer") ?? null;
    headerSections = (data.page?.headerSections as any[]) ?? [];
    footerSections = (data.page?.footerSections as any[]) ?? [];
    headerSettings = (data.page?.headerSettings as Record<string, unknown>) ?? {};
    footerSettings = (data.page?.footerSettings as Record<string, unknown>) ?? {};
    console.log(`[store-render-debug] PAGE_DATA_READY tenant="${slug}" sectionsCount=${pageSections.length}`);
  } catch (err: any) {
    console.error(`[store-render-error] stage="PAGE_DATA_READY" tenant="${slug}":`, err?.message);
    if (err?.stack) console.error(`[store-render-error] stack:`, err.stack);
    throw err;
  }

  console.log(`[store-render-debug] RENDER_COMPONENT_START tenant="${slug}"`);

  const { products, sliders } = data;
  const categories = data.categories ?? [];
  const navigations = data.navigations ?? [];
  const contact = data.contact ?? null;

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
