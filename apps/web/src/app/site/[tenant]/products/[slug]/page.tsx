import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import { fetchPublicProductPage } from "@/lib/server/fetch-public-product";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ tenant: string; slug: string }>;
}) {
  const { tenant, slug } = await params;
  const host = (await headers()).get("host") ?? "";
  const data = await fetchPublicProductPage(slug, host, tenant);
  if (!data?.store || !data?.product) notFound();

  return (
    <div className="pb-24 lg:pb-10">
      <ProductDetailClient product={data.product} />
    </div>
  );
}
