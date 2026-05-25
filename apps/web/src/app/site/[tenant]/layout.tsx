import { notFound } from "next/navigation";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreFooter } from "@/components/storefront/store-footer";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";
import { CartProvider } from "@/components/storefront/cart-provider";
import { AuthInit } from "@/components/auth/auth-init";
import { TenantProvider, type ThemeData, type ProductData, type StoreData } from "@/providers/tenant-provider";

type SiteData = {
  store: StoreData | null;
  tenant: Record<string, unknown> | null;
  page: Record<string, unknown> | null;
  products: ProductData[];
};

async function fetchTenantSite(slug: string): Promise<SiteData | null> {
  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/public/tenant/${slug}`, { cache: "no-store" });
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

  const { store, products } = data;
  const theme: ThemeData = store.theme ?? {
    primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter",
    buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed"
  };

  return (
    <div style={{ fontFamily: theme.font, backgroundColor: theme.darkMode ? "#000000" : "#ffffff" }}>
      <TenantProvider value={{ store, theme, products }}>
        <AuthInit />
        <StoreNavbar />
        <CartProvider>
          {children}
        </CartProvider>
        <StoreFooter />
        <FloatingAdminBar storeId={store._id} primaryColor={theme.primaryColor} />
      </TenantProvider>
    </div>
  );
}
