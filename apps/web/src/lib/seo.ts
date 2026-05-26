export type SEOData = {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  schema?: Record<string, unknown>;
};

export function generateWebsiteSchema(storeName: string, url: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: storeName,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateProductSchema(product: {
  name: string; description: string; price: number; currency: string;
  image?: string; sku?: string; availability?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability ?? "https://schema.org/InStock",
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getSEOMeta(seo: SEOData) {
  const tags: Record<string, string> = {
    title: seo.title,
    description: seo.description,
  };
  if (seo.ogImage) tags["og:image"] = seo.ogImage;
  if (seo.canonicalUrl) tags["canonical"] = seo.canonicalUrl;
  if (seo.noIndex) tags["robots"] = "noindex, nofollow";
  return tags;
}
