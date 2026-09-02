import { redirect } from "next/navigation";

export default async function FinanceCOAPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/finance/accounting?tab=coa`);
}
