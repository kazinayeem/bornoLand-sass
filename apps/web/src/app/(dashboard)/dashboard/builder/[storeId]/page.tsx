import { redirect } from "next/navigation";
import { getStoreSlugById, getBuilderPageSlugById, isMongoObjectId } from "@/lib/server/store-lookup";

type LegacyBuilderRedirectProps = {
  params: Promise<{ storeId: string }>;
};

export default async function LegacyBuilderRedirect({ params }: LegacyBuilderRedirectProps) {
  const { storeId } = await params;
  const storeSlug = await getStoreSlugById(storeId);
  if (!storeSlug) redirect("/dashboard/stores");
  redirect(`/store/${storeSlug}/builder`);
}
