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
import { generateTenantMetadata } from "@/lib/server/page-metadata";

/** ISR — public storefront shell (store, theme, products, categories, navigation) */
export const revalidate = 60;

/** On-demand ISR: tenants generated on first visit; publish invalidates via cache tags */
export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params;
  return generateTenantMetadata({
    tenant,
    pageTitle: "Home",
    canonicalPath: `/site/${tenant}`,
  });
}

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
  } | null;

  // Only 404 when the store itself does not exist. Transient API failures throw
  // from fetchTenantSite and must not be cached as a sticky ISR 404.
  if (!data?.store) {
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_TENANT_ROUTING === "1") {
      console.log(`[site-layout] notFound — store missing for tenant="${slug}"`);
    }
    notFound();
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
  const theme: ThemeData = store.theme ?? {
    primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter",
    buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed",
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
