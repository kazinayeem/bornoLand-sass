import { notFound } from "next/navigation";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import { normalizeSectionType } from "@/lib/section-registry";
import type { ThemeData, StoreData, StoreSettingsData, ProductData, CategoryData, HomepageSliderData } from "@/providers/tenant-provider";

type Props = {
  storeSlug: string;
  pageSlug: string;
};

const HEADER_TYPES = new Set(["header-bar", "header-logo", "header-nav", "header-icons"]);
const FOOTER_TYPES = new Set(["simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "footer-links", "footer-copyright", "footer-social"]);

export async function StorefrontPageRenderer({ storeSlug, pageSlug }: Props) {
  const data = await fetchTenantSite(storeSlug, pageSlug);
  if (!data?.store || !data?.page) {
    notFound();
  }

  const { store, products, settings, sliders, page } = data as any;
  const categories: CategoryData[] = (data.categories ?? []) as CategoryData[];
  const pageSections = (page?.sections as any[]) ?? [];
  const headerSections = (page?.headerSections as any[]) ?? [];
  const footerSections = (page?.footerSections as any[]) ?? [];
  const headerSettings = (page?.headerSettings as Record<string, unknown>) ?? {};
  const footerSettings = (page?.footerSettings as Record<string, unknown>) ?? {};
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

  // Filter out header/footer sections from body sections to prevent double rendering
  const bodySections = pageSections.filter((s: any) => {
    const normalized = normalizeSectionType(s.type);
    return !HEADER_TYPES.has(normalized) && !FOOTER_TYPES.has(normalized);
  });

  return (
    <StorefrontShell
      store={store}
      theme={theme}
      products={products}
      categories={categories}
      settings={currencySettings}
      sliders={sliders ?? []}
      pageSections={bodySections}
      headerSections={headerSections}
      footerSections={footerSections}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      footerSection={footerSection}
      showAdminBar
    >
      <StorefrontCanvas sections={bodySections} />
    </StorefrontShell>
  );
}
