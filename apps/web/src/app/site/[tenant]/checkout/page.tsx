import { notFound } from "next/navigation";
import { fetchTenantSite } from "@/lib/server/tenant-site";
import {
  fetchPublicPaymentMethods,
  fetchPublicDeliveryZones,
} from "@/lib/server/checkout-data";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";

export const revalidate = 60;

type CheckoutPageProps = {
  params: Promise<{ tenant: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { tenant } = await params;
  const siteData = await fetchTenantSite(tenant);

  if (!siteData?.store) {
    notFound();
  }

  const storeId = (siteData.store as { _id?: string })._id;

  // Server-side cached data fetching in parallel
  const [paymentMethods, deliveryZones] = await Promise.all([
    fetchPublicPaymentMethods(storeId, tenant),
    fetchPublicDeliveryZones(storeId, tenant),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <CheckoutForm
        initialPaymentMethods={paymentMethods}
        initialDeliveryZones={deliveryZones}
        store={siteData.store as any}
        settings={siteData.settings as any}
        theme={(siteData.store as any)?.theme}
        tenantSlug={tenant}
      />
    </div>
  );
}
