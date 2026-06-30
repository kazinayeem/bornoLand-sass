import { getCmsPageForTenant } from "@/lib/server/cms-page";
import { ContactPageClient } from "./contact-page-client";

export const revalidate = 60;

export default async function ContactPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "contact-us");
  return <ContactPageClient initialPage={initialPage} />;
}
