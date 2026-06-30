import { ProductSlugRedirect } from "./product-redirect";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductSlugRedirect slug={slug} />;
}
