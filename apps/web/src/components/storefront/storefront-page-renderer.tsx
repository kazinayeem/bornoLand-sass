import { notFound } from "next/navigation";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import { normalizeSectionType } from "@/lib/section-registry";
import type { ThemeData, StoreData, StoreSettingsData, ProductData, CategoryData, HomepageSliderData, NavigationData } from "@/providers/tenant-provider";
import type { StoreContact } from "@/redux/api/store-contact-api";

import { getThemeById } from "@/themes/registry";

type Props = {
  storeSlug: string;
  pageSlug: string;
};

const HEADER_TYPES = new Set(["header-bar", "header-logo", "header-nav", "header-icons"]);
const FOOTER_TYPES = new Set(["simple-footer", "ecommerce-footer", "mega-footer", "multi-column-footer", "footer-links", "footer-copyright", "footer-social"]);

export async function StorefrontPageRenderer({ storeSlug, pageSlug }: Props) {
  const data = await fetchTenantSite(storeSlug, pageSlug);
  if (!data?.store) {
    notFound();
  }

  const { store, products, settings, sliders } = data as any;
  const activeTheme = getThemeById(store.theme?.themeId || "grocery");
  const rawPage = data.page as any;
  const page = rawPage ?? {
    title: store.name || "Home",
    slug: pageSlug === "home" ? "/" : `/${pageSlug}`,
    sections: pageSlug === "home" ? activeTheme.defaultSections : [],
    headerSections: [],
    footerSections: [],
    headerSettings: store.headerSettings || {},
    footerSettings: store.footerSettings || {},
  };

  const categories: CategoryData[] = (data.categories ?? []) as CategoryData[];
  const navigations: NavigationData[] = (data.navigations ?? []) as NavigationData[];
  const contact: StoreContact | null = (data.contact as StoreContact | null) ?? null;
  const tracking = (data.tracking as any) ?? null;
  const rawPageSections = (page?.sections as any[]) ?? [];
  const pageSections = (pageSlug === "home" && rawPageSections.length === 0) ? activeTheme.defaultSections : rawPageSections;
  const headerSections = (page?.headerSections as any[]) ?? [];
  const footerSections = (page?.footerSections as any[]) ?? [];
  const headerSettings = (page?.headerSettings as Record<string, unknown>) ?? store.headerSettings ?? {};
  const footerSettings = (page?.footerSettings as Record<string, unknown>) ?? store.footerSettings ?? {};
  const theme: ThemeData = store.theme ?? {
    themeId: activeTheme.id,
    primaryColor: activeTheme.tokens.colors.primary,
    secondaryColor: activeTheme.tokens.colors.secondary,
    font: activeTheme.tokens.typography.fontFamily,
    buttonStyle: "rounded-lg",
    layoutWidth: "1280px",
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
  const footerSection = pageSections.find((section: any) => section.type === "footer") ?? null;

  // Filter out header/footer sections from body sections to prevent double rendering
  const bodySections = pageSections.filter((s: any) => {
    const normalized = normalizeSectionType(s.type);
    return !HEADER_TYPES.has(normalized) && !FOOTER_TYPES.has(normalized);
  });

  const storeWithBranding: StoreData = {
    ...store,
    shortName: store.shortName,
    tagline: store.tagline,
    faviconUrl: store.faviconUrl,
  };

  return (
    <StorefrontShell
      store={storeWithBranding}
      theme={theme}
      products={products}
      categories={categories}
      settings={currencySettings}
      sliders={sliders ?? []}
      navigations={navigations}
      contact={contact}
      tracking={tracking}
      pageSections={bodySections}
      headerSections={headerSections}
      footerSections={footerSections}
      headerSettings={headerSettings}
      footerSettings={footerSettings}
      footerSection={footerSection}
      showAdminBar={false}
    >
      <StorefrontCanvas sections={bodySections} />
    </StorefrontShell>
  );
}
