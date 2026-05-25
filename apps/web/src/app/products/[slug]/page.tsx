import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AuthInit } from "@/components/auth/auth-init";
import { CartProvider } from "@/components/storefront/cart-provider";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { TenantProvider, type HomepageSliderData, type ProductData, type StoreData, type StoreSettingsData, type ThemeData } from "@/providers/tenant-provider";
import { ProductDetailClient } from "@/app/site/[tenant]/products/[slug]/product-detail-client";

type ProductRouteData = {
  store: StoreData;
  tenant: Record<string, unknown> | null;
  settings: StoreSettingsData;
  sliders: HomepageSliderData[];
  products: ProductData[];
  product: ProductData;
};

async function fetchProductPage(slug: string, host: string): Promise<ProductRouteData | null> {
  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/products/${slug}`, {
      cache: "no-store",
      headers: { "x-forwarded-host": host }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const data = await fetchProductPage(slug, host);
  if (!data?.store || !data?.product) notFound();

  const theme: ThemeData = data.store.theme ?? {
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    font: "Inter",
    buttonStyle: "rounded-lg",
    layoutWidth: "1200px",
    darkMode: false,
    navbarStyle: "fixed",
  };

  return (
    <TenantProvider value={{
      store: data.store,
      theme,
      products: data.products ?? [],
      settings: data.settings,
      sliders: data.sliders ?? [],
      pageSections: [],
    }}>
      <AuthInit />
      <StoreNavbar />
      <CartProvider>
        <main className="pb-24 lg:pb-10">
          <ProductDetailClient product={data.product} />
        </main>
      </CartProvider>
      <StoreFooter />
      <FloatingAdminBar storeId={data.store._id} primaryColor={theme.primaryColor} />
    </TenantProvider>
  );
}