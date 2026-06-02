import { notFound } from "next/navigation";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";

type SiteData = {
  page: {
    sections?: { id: string; type: string; visible?: boolean; props?: Record<string, string | number | boolean | null | undefined> }[];
  } | null;
};

async function fetchTenantSite(slug: string): Promise<SiteData | null> {
  try {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const res = await fetch(`${apiUrl}/public/tenant/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      console.debug(`[tenant] fetch failed for ${slug}: ${res.status}`);
      return null;
    }
    const json = await res.json();
    const hasSections = json.data?.page?.sections?.length > 0;
    console.debug(`[tenant] ${slug}: store=${!!json.data?.store}, sections=${json.data?.page?.sections?.length ?? 0}`);
    return json.data ?? null;
  } catch (err) {
    console.debug(`[tenant] fetch error for ${slug}:`, err);
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
