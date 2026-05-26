import { notFound } from "next/navigation";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { CartProvider } from "@/components/storefront/cart-provider";
import { AuthInit } from "@/components/auth/auth-init";
import { TenantProvider, type ThemeData, type ProductData, type CategoryData, type StoreData, type StoreSettingsData, type HomepageSliderData } from "@/providers/tenant-provider";
import { env } from "@/config/env";

type SiteData = {
  store: StoreData | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: ProductData[];
  categories?: CategoryData[];
  settings?: StoreSettingsData | null;
  sliders?: HomepageSliderData[];
};

async function fetchTenantSite(slug: string): Promise<SiteData | null> {
  try {
    const apiUrl = env.API_SERVER_URL;
    const res = await fetch(`${apiUrl}/public/tenant/${slug}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function TenantLayout({ params, children }: { params: Promise<{ tenant: string }>; children: React.ReactNode }) {
  const { tenant: slug } = await params;
  const data = await fetchTenantSite(slug);
  if (!data?.store) notFound();

  const { store, products, settings, sliders } = data;
  const categories = data.categories ?? [];
  const pageSections = (data.page?.sections as { id: string; type: string; visible?: boolean; props?: Record<string, string> }[] | undefined) ?? [];
  const theme: ThemeData = store.theme ?? {
    primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter",
  };

  return (
    <TenantProvider value={{ store, products, categories, settings: settings ?? { currencyCode: "USD", currencySymbol: "$", currencyPosition: "before", locale: "en-US", decimalPlaces: 2, taxRate: 0 }, sliders: sliders ?? [], theme, pageSections }}>
      <CartProvider>
        <AuthInit />
        <div className="flex flex-col min-h-screen" style={{ fontFamily: theme.font }}>
          <StoreNavbar />
          <main className="flex-1">{children}</main>
          <StoreFooter />
        </div>
        <FloatingAdminBar storeId={store._id} primaryColor={theme.primaryColor} />
      </CartProvider>
    </TenantProvider>
  );
}
