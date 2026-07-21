import { getCmsPageForTenant } from "@/lib/server/cms-page";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import { getApiUrl } from "@/lib/urls";
import FaqPageClient from "./faq-page-client";

export const revalidate = 60;

async function fetchPublicFaqs(storeId: string) {
  try {
    const apiUrl = getApiUrl();
    if (!apiUrl) return [];
    const res = await fetch(`${apiUrl}/public/faqs?storeId=${storeId}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json?.data?.faqs) ? json.data.faqs : [];
  } catch {
    return [];
  }
}

export default async function FaqPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const site = await fetchTenantSite(tenant);
  const storeId = (site?.store as { _id?: string } | null)?._id;
  const [cmsPage, faqs] = await Promise.all([
    getCmsPageForTenant(tenant, "faq", storeId),
    storeId ? fetchPublicFaqs(storeId) : Promise.resolve([]),
  ]);

  return (
    <FaqPageClient
      initialFaqs={faqs}
      introHtml={faqs.length === 0 ? cmsPage?.html : undefined}
    />
  );
}
