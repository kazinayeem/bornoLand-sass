import { getCmsPageForTenant } from "@/lib/server/cms-page";
import CmsPageView from "@/components/storefront/cms-page-view";

export const revalidate = 60;

export default async function TermsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "terms-conditions");
  return (
    <CmsPageView
      slug="terms-conditions"
      title="Terms of Service"
      description="Store terms and conditions"
      iconName="file"
      initialPage={initialPage}
    />
  );
}
