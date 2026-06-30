import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import {
  type ThemeData,
  type ProductData,
  type CategoryData,
  type StoreData,
  type StoreSettingsData,
  type HomepageSliderData,
} from "@/providers/tenant-provider";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { generateTenantMetadata } from "@/lib/server/page-metadata";

export const revalidate = 60;

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
  } | null;
  if (!data?.store) notFound();

  const { store, products, settings, sliders } = data;
  const categories = data.categories ?? [];
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

  return (
    <StorefrontShell
      store={store}
      theme={theme}
      products={products}
      categories={categories}
      settings={currencySettings}
      sliders={sliders ?? []}
      pageSections={pageSections}
      footerSection={footerSection}
      showAdminBar
    >
      {children}
    </StorefrontShell>
  );
}
