import { redirect } from "next/navigation";

export default async function SupportRootPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/support/tickets`);
}
