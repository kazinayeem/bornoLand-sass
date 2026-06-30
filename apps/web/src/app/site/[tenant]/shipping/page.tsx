import { getCmsPageForTenant } from "@/lib/server/cms-page";
import CmsPageView from "@/components/storefront/cms-page-view";

export const revalidate = 60;

export default async function ShippingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "shipping-info");
  return (
    <CmsPageView
      slug="shipping-info"
      title="Shipping Information"
      description="Delivery options, times, and costs"
      iconName="truck"
      initialPage={initialPage}
    />
  );
}
