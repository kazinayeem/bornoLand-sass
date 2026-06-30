import { redirect } from "next/navigation";
import { getStoreSlugById } from "@/lib/server/store-lookup";
import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

type LegacyCmsSlugRedirectProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ storeId?: string }>;
};

export default async function LegacyCmsSlugRedirect({ params, searchParams }: LegacyCmsSlugRedirectProps) {
  const { slug } = await params;
  const { storeId } = await searchParams;
  const cmsPath = slug === "faq" ? "faqs" : slug;

  if (storeId) {
    const storeSlug = await getStoreSlugById(storeId);
    if (storeSlug) redirect(`/store/${storeSlug}/cms/${cmsPath}`);
  }

  return (
    <LegacyStoreRouteRedirect
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/cms/${cmsPath}`}
    />
  );
}
