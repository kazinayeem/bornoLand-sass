import { NextRequest, NextResponse } from "next/server";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { getTenantCanonicalUrl } from "@/lib/urls";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant } = await params;
  const data = await fetchTenantSite(tenant);

  if (!data?.store) {
    return new NextResponse("Store not found", { status: 404 });
  }

  const products = (data.products ?? []) as Array<{ slug?: string; updatedAt?: string }>;
  const categories = (data.categories ?? []) as Array<{ slug?: string; updatedAt?: string }>;
  const now = new Date().toISOString();

  const staticUrls = [
    { url: getTenantCanonicalUrl(tenant, "/"), changefreq: "daily", priority: "1.0", lastmod: now },
    { url: getTenantCanonicalUrl(tenant, "/shop"), changefreq: "daily", priority: "0.9", lastmod: now },
    { url: getTenantCanonicalUrl(tenant, "/categories"), changefreq: "weekly", priority: "0.8", lastmod: now },
    { url: getTenantCanonicalUrl(tenant, "/search"), changefreq: "weekly", priority: "0.6", lastmod: now },
    { url: getTenantCanonicalUrl(tenant, "/contact"), changefreq: "monthly", priority: "0.5", lastmod: now },
    { url: getTenantCanonicalUrl(tenant, "/faq"), changefreq: "monthly", priority: "0.5", lastmod: now },
  ];

  const productUrls = products
    .filter((p) => p.slug)
    .map((p) => ({
      url: getTenantCanonicalUrl(tenant, `/products/${p.slug}`),
      changefreq: "daily",
      priority: "0.8",
      lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : now,
    }));

  const categoryUrls = categories
    .filter((c) => c.slug)
    .map((c) => ({
      url: getTenantCanonicalUrl(tenant, `/category/${c.slug}`),
      changefreq: "weekly",
      priority: "0.7",
      lastmod: c.updatedAt ? new Date(c.updatedAt).toISOString() : now,
    }));

  const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
