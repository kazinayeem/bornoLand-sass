import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "./product-detail-client";
import { fetchPublicProductPage } from "@/lib/server/fetch-public-product";
import { buildProductJsonLd, generateStorefrontProductMetadata } from "@/lib/server/page-metadata";
import { getTenantCanonicalUrl } from "@/lib/urls";

/** ISR — product pages revalidate every 60s and on product updates via cache tags */
export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}): Promise<Metadata> {
  const { tenant, slug } = await params;
  const host = (await headers()).get("host") ?? "";
  const data = await fetchPublicProductPage(slug, host, tenant);

  if (!data?.product) {
    return { title: "Product Not Found" };
  }

  return generateStorefrontProductMetadata({
    tenant,
    product: data.product,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const { tenant, slug } = await params;
  const host = (await headers()).get("host") ?? "";
  const data = await fetchPublicProductPage(slug, host, tenant);
  if (!data?.store || !data?.product) notFound();

  const canonicalUrl = getTenantCanonicalUrl(tenant, `/products/${slug}`);
  const jsonLd = buildProductJsonLd({
    product: data.product,
    currencyCode: data.settings?.currencyCode || "USD",
    storeName: data.store?.name || "Store",
    canonicalUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pb-24 lg:pb-10">
        <ProductDetailClient product={data.product} />
      </div>
    </>
  );
}

