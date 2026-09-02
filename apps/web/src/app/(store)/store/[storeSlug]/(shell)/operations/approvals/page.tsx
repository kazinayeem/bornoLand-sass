import { redirect } from "next/navigation";

export default async function OperationsApprovalsPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/operations/tasks?tab=approvals`);
}
