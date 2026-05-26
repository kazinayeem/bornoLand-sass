import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { AuthInit } from "@/components/auth/auth-init";
import { CartProvider } from "@/components/storefront/cart-provider";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { TenantProvider, type HomepageSliderData, type ProductData, type StoreData, type StoreSettingsData, type ThemeData } from "@/providers/tenant-provider";
import { ProductDetailClient } from "@/app/site/[tenant]/products/[slug]/product-detail-client";
import { env } from "@/config/env";

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
    const apiUrl = env.API_SERVER_URL;
    const res = await fetch(`${apiUrl}/public/product/${slug}`, {
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
  if (!data) notFound();

  const theme: ThemeData = data.store.theme ?? {
    primaryColor: "#2563eb",
    secondaryColor: "#0f172a",
    font: "Inter",
  };

  return (
    <TenantProvider value={{ store: data.store, products: data.products, categories: [], settings: data.settings, sliders: data.sliders, theme, pageSections: [] }}>
      <CartProvider>
        <AuthInit />
        <div className="flex flex-col min-h-screen" style={{ fontFamily: theme.font }}>
          <StoreNavbar />
          <main className="flex-1">
            <ProductDetailClient product={data.product} />
          </main>
          <StoreFooter />
        </div>
        <FloatingAdminBar storeId={data.store._id} primaryColor={theme.primaryColor} />
      </CartProvider>
    </TenantProvider>
  );
}
