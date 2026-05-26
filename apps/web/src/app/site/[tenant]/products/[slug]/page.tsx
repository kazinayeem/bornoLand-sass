import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";
import type { ProductData } from "@/providers/tenant-provider";
import { env } from "@/config/env";

async function fetchProduct(slug: string, host: string) {
  try {
    const apiUrl = env.API_SERVER_URL;
    const res = await fetch(`${apiUrl}/public/product/${slug}`, {
      cache: "no-store",
      headers: { "x-forwarded-host": host },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.product ?? null;
  } catch {
    return null;
  }
}

export default async function TenantProductPage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const product = await fetchProduct(slug, host);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
