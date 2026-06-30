import { getCmsPageForTenant } from "@/lib/server/cms-page";
import CmsPageView from "@/components/storefront/cms-page-view";

export const revalidate = 60;

export default async function PrivacyPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "privacy-policy");
  return (
    <CmsPageView
      slug="privacy-policy"
      title="Privacy Policy"
      description="Data collection, usage, and protection"
      iconName="shield"
      initialPage={initialPage}
    />
  );
}
