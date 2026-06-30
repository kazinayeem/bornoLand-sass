import { getCmsPageForTenant } from "@/lib/server/cms-page";
import CmsPageView from "@/components/storefront/cms-page-view";

export const revalidate = 60;

export default async function SizeGuidePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "size-guide");
  return (
    <CmsPageView
      slug="size-guide"
      title="Size Guide"
      description="Size measurements and fit information"
      iconName="ruler"
      initialPage={initialPage}
    />
  );
}
