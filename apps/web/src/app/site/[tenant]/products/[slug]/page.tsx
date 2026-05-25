import { notFound } from "next/navigation";
import { ProductDetailClient } from "./product-detail-client";

type ProductData = {
  _id: string; storeId: string; name: string; slug: string;
  description: string; price: number; comparePrice?: number;
  category: string; stock: number; status: "active" | "inactive";
  sku: string; images: string[]; featured: boolean;
  createdAt: string; updatedAt: string;
};

async function getProduct(tenant: string, slug: string): Promise<ProductData | null> {
  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/public/product/${tenant}/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.product ?? null;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant, slug } = await params;
  const product = await getProduct(tenant, slug);
  if (!product || product.status !== "active") notFound();

  return <ProductDetailClient product={product} />;
}
