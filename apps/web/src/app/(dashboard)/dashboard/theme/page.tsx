import { redirect } from "next/navigation";
import { getStoreSlugById } from "@/lib/server/store-lookup";
import { LegacyStoreRouteRedirect } from "@/components/store-dashboard/legacy-store-route-redirect";

type LegacyThemeRedirectProps = {
  searchParams: Promise<{ storeId?: string }>;
};

export default async function LegacyThemeRedirect({ searchParams }: LegacyThemeRedirectProps) {
  const { storeId } = await searchParams;

  if (storeId) {
    const storeSlug = await getStoreSlugById(storeId);
    if (storeSlug) redirect(`/store/${storeSlug}/theme`);
  }

  return (
    <LegacyStoreRouteRedirect
      resolveTargetPath={(storeSlug) => `/store/${storeSlug}/theme`}
    />
  );
}
