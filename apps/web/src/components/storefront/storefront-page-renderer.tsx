import { notFound } from "next/navigation";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import type { ThemeData, StoreData, StoreSettingsData, ProductData, CategoryData, HomepageSliderData } from "@/providers/tenant-provider";

type Props = {
  storeSlug: string;
  pageSlug: string;
};

export async function StorefrontPageRenderer({ storeSlug, pageSlug }: Props) {
  const data = await fetchTenantSite(storeSlug, pageSlug);
  if (!data?.store || !data?.page) {
    notFound();
  }

  const { store, products, settings, sliders, page } = data as any;
  const categories = data.categories ?? [];
  const pageSections = (page?.sections as any[]) ?? [];
  const theme: ThemeData = store.theme ?? {
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    font: "Inter",
    buttonStyle: "rounded-lg",
    layoutWidth: "1200px",
    darkMode: false,
    navbarStyle: "fixed",
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
      <StorefrontCanvas sections={pageSections} />
    </StorefrontShell>
  );
}
