import { redirect } from "next/navigation";

export default async function FinanceRootPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/finance/accounting`);
}
