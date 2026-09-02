import { redirect } from "next/navigation";

export default async function HrmRootPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/hrm/employees`);
}
