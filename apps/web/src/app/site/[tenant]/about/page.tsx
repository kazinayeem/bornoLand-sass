import { getCmsPageForTenant } from "@/lib/server/cms-page";
import { AboutPageClient } from "./about-page-client";

export const revalidate = 60;

export default async function AboutPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const initialPage = await getCmsPageForTenant(tenant, "about-us");
  return <AboutPageClient initialPage={initialPage} />;
}
