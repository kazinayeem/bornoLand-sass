import { getCmsPageForTenant } from "@/lib/server/cms-page";
import CmsPageView from "@/components/storefront/cms-page-view";

export const revalidate = 60;

export default async function FaqPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "faq");
  return (
    <CmsPageView
      slug="faq"
      title="FAQ"
      description="Frequently asked questions"
      iconName="help"
      initialPage={initialPage}
    />
  );
}
