import { redirect } from "next/navigation";

export default async function CrmRootPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/crm/deals`);
}
