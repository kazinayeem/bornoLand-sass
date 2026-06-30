import { getCmsPageForTenant } from "@/lib/server/cms-page";
import CmsPageView from "@/components/storefront/cms-page-view";

export const revalidate = 60;

export default async function ReturnsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "returns");
  return (
    <CmsPageView
      slug="returns"
      title="Returns & Exchanges"
      description="Return policy and exchange information"
      iconName="returns"
      initialPage={initialPage}
    />
  );
}
