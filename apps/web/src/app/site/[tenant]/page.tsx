import { notFound } from "next/navigation";
import { StoreNavbar } from "@/components/storefront/store-navbar";
import { StoreHero } from "@/components/storefront/store-hero";
import { FeaturedProducts } from "@/components/storefront/featured-products";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import { StoreFooter } from "@/components/storefront/store-footer";
import { FloatingAdminBar } from "@/components/storefront/floating-admin-bar";

type ProductData = {
  _id: string; storeId: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; status: "active" | "inactive";
  sku: string; images: string[]; featured: boolean;
  createdAt: string; updatedAt: string;
};

type ThemeData = {
  primaryColor: string; secondaryColor: string; font: string;
  buttonStyle: string; layoutWidth: string; darkMode: boolean; navbarStyle: string;
};

type SiteData = {
  store: {
    _id: string; name: string; slug: string; subdomain: string;
    description: string; theme: ThemeData; logoUrl?: string;
    selectedTemplateId?: Record<string, unknown>;
  } | null;
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

export default async function TenantSitePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const data = await fetchTenantSite(slug);
  if (!data?.store) notFound();

  const { store, products } = data;
  const theme = store.theme ?? {
    primaryColor: "#2563eb", secondaryColor: "#0f172a", font: "Inter",
    buttonStyle: "rounded-lg", layoutWidth: "1200px", darkMode: false, navbarStyle: "fixed"
  };

  const layoutClass = theme.layoutWidth === "100%" ? "" : "max-w-7xl";
  const displayProducts = (products ?? []).filter((p) => p.status === "active");

  return (
    <div style={{ fontFamily: theme.font, backgroundColor: theme.darkMode ? "#000000" : "#ffffff" }}>
      <StoreNavbar
        storeName={store.name}
        logoUrl={store.logoUrl}
        primaryColor={theme.primaryColor}
        font={theme.font}
        navbarStyle={theme.navbarStyle}
      />

      <StoreHero
        primaryColor={theme.primaryColor}
        secondaryColor={theme.secondaryColor}
        buttonStyle={theme.buttonStyle}
        font={theme.font}
        darkMode={theme.darkMode}
        storeName={store.name}
      />

      <section className="py-4 sm:py-6" style={{ backgroundColor: theme.darkMode ? "#000000" : "#ffffff" }}>
        <div className={`mx-auto ${layoutClass} px-4 sm:px-6 lg:px-8`}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {["Clothing", "Electronics", "Accessories", "Footwear"].map((cat) => (
              <a key={cat} href="#"
                className="group flex flex-col items-center gap-2 rounded-2xl border p-4 sm:p-6 transition-all hover:shadow-md"
                style={{ borderColor: theme.darkMode ? "#27272a" : "#e4e4e7", backgroundColor: theme.darkMode ? "#18181b" : "#fafafa" }}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14"
                  style={{ backgroundColor: `${theme.primaryColor}12` }}>
                  <span className="text-lg sm:text-xl" style={{ color: theme.primaryColor }}>{cat[0]}</span>
                </div>
                <span className="text-xs font-medium sm:text-sm" style={{ color: theme.darkMode ? "#fafafa" : "#18181b" }}>{cat}</span>
                <span className="text-[10px] sm:text-xs" style={{ color: theme.darkMode ? "#71717a" : "#a1a1aa" }}>Shop now</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {displayProducts.length > 0 && (
        <FeaturedProducts
          products={displayProducts}
          primaryColor={theme.primaryColor}
          buttonStyle={theme.buttonStyle}
          font={theme.font}
          darkMode={theme.darkMode}
        />
      )}

      <TestimonialsSection
        primaryColor={theme.primaryColor}
        font={theme.font}
        darkMode={theme.darkMode}
      />

      <NewsletterSection
        primaryColor={theme.primaryColor}
        buttonStyle={theme.buttonStyle}
        font={theme.font}
        darkMode={theme.darkMode}
      />

      <StoreFooter
        storeName={store.name}
        primaryColor={theme.primaryColor}
        font={theme.font}
        darkMode={theme.darkMode}
      />

      <FloatingAdminBar storeId={store._id} primaryColor={theme.primaryColor} />
    </div>
  );
}
