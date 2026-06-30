import { notFound } from "next/navigation";
import { StorefrontCanvas } from "@/components/storefront/storefront-canvas";
import { fetchTenantSite } from "@/lib/server/tenant-site";

export default async function TenantSitePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const data = (await fetchTenantSite(slug)) as {
    page: {
      sections?: { id: string; type: string; visible?: boolean; props?: Record<string, string | number | boolean | null | undefined> }[];
    } | null;
  } | null;
  if (!data) notFound();

  return (
    <StorefrontCanvas sections={data.page?.sections ?? []} />
  );
}
