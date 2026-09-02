import { redirect } from "next/navigation";

type StoreIndexPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function StoreIndexPage({ params }: StoreIndexPageProps) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/dashboard`);
}
