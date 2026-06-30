import { redirect } from "next/navigation";
import { getStoreSlugById, getBuilderPageSlugById, isMongoObjectId } from "@/lib/server/store-lookup";

type LegacyBuilderPageRedirectProps = {
  params: Promise<{ storeId: string; pageParam: string }>;
};

export default async function LegacyBuilderPageRedirect({ params }: LegacyBuilderPageRedirectProps) {
  const { storeId, pageParam } = await params;
  const storeSlug = await getStoreSlugById(storeId);
  if (!storeSlug) redirect("/dashboard/stores");

  if (isMongoObjectId(pageParam)) {
    const pageSlug = await getBuilderPageSlugById(pageParam);
    redirect(`/store/${storeSlug}/builder/${pageSlug ?? "home"}`);
  }

  redirect(`/store/${storeSlug}/builder/${pageParam}`);
}
