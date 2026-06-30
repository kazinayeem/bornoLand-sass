import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { StorefrontFrame } from "@/components/storefront/storefront-frame";
import { TenantProvider, type HomepageSliderData, type ProductData, type StoreData, type StoreSettingsData, type ThemeData } from "@/providers/tenant-provider";
import { ProductDetailClient } from "@/app/site/[tenant]/products/[slug]/product-detail-client";
import { CACHE_REVALIDATE, cacheTags } from "@/lib/server/cache-tags";
import { buildPageMetadata } from "@/lib/server/page-metadata";
import { extractSubdomainFromHost, getApiUrl, getTenantCanonicalUrl } from "@/lib/urls";

/** ISR — product detail pages */
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const host = (await headers()).get("host") ?? "";
  const data = await fetchProductPage(slug, host);
  if (!data?.store || !data?.product) {
    return buildPageMetadata({
      title: "Product",
      description: "Product details",
      canonicalPath: `/products/${slug}`,
    });
  }
  const storeName = data.store.name || "Store";
  const tenantSlug = extractSubdomainFromHost(host) ?? data.store.slug;
  return buildPageMetadata({
    title: `${data.product.name} • ${storeName}`,
    description: data.product.description || `${data.product.name} at ${storeName}`,
    canonicalPath: getTenantCanonicalUrl(tenantSlug, `/products/${slug}`),
    iconUrl: data.store.logoUrl,
    keywords: [data.product.name, storeName, "product", "shop"].join(", "),
    ogImage: data.product.images?.[0] || data.store.logoUrl,
  });
}

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
    const apiUrl = getApiUrl();
    if (!apiUrl) return null;
    const tenantSlug = extractSubdomainFromHost(host) ?? host.split(".")[0];
    const res = await fetch(`${apiUrl}/public/product/${slug}`, {
      next: {
        revalidate: CACHE_REVALIDATE.product,
        tags: [cacheTags.product(slug), cacheTags.tenant(tenantSlug)],
      },
      headers: { "x-forwarded-host": host },
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
    <StorefrontFrame
      store={data.store}
      theme={theme}
      products={data.products ?? []}
      categories={[]}
      settings={data.settings}
      sliders={data.sliders ?? []}
      pageSections={[]}
      adminBarStoreId={data.store._id}
      showAdminBar
    >
      <main className="pb-24 lg:pb-10">
        <ProductDetailClient product={data.product} />
      </main>
    </StorefrontFrame>
  );
}