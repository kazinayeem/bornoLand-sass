import { notFound } from "next/navigation";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";

type SiteData = {
  page: {
    sections?: { id: string; type: string; visible?: boolean; props?: Record<string, unknown> }[];
  } | null;
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
  if (!data) notFound();

  return (
    <StorefrontCanvas sections={data.page?.sections ?? []} />
  );
}
