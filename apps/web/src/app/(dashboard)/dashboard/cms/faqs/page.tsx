import { redirect } from "next/navigation";
import { getStoreSlugById } from "@/lib/server/store-lookup";
import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

type LegacyCmsFaqsRedirectProps = {
  searchParams: Promise<{ storeId?: string }>;
};

export default async function LegacyCmsFaqsRedirect({ searchParams }: LegacyCmsFaqsRedirectProps) {
  const { storeId } = await searchParams;

  if (storeId) {
    const storeSlug = await getStoreSlugById(storeId);
    if (storeSlug) redirect(`/store/${storeSlug}/cms/faqs`);
  }

  return (
    <LegacyStoreRouteRedirect
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/cms/faqs`}
    />
  );
}
