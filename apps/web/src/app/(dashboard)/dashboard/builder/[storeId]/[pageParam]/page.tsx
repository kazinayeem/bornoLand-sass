import { redirect } from "next/navigation";
import { getStoreSlugById } from "@/lib/server/store-lookup";

type LegacyBuilderPageRedirectProps = {
  params: Promise<{ storeId: string; pageParam: string }>;
};

export default async function LegacyBuilderPageRedirect({ params }: LegacyBuilderPageRedirectProps) {
  const { storeId } = await params;
  const storeSlug = await getStoreSlugById(storeId);
  if (!storeSlug) redirect("/dashboard/stores");
  redirect(`/store/${storeSlug}/builder/home`);
}
