import { getCmsPageForTenant } from "@/lib/server/cms-page";
import { getStoreContactForTenant } from "@/lib/server/store-contact";
import { ContactPageClient } from "./contact-page-client";

export const revalidate = 60;

export default async function ContactPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const [initialPage, initialContact] = await Promise.all([
    getCmsPageForTenant(tenant, "contact-us"),
    getStoreContactForTenant(tenant),
  ]);
  return <ContactPageClient initialPage={initialPage} initialContact={initialContact} />;
}
