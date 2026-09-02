import { redirect } from "next/navigation";

type StoreSlugPageProps = {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
};

export default async function StoreSlugFallbackPage({ params }: StoreSlugPageProps) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/dashboard`);
}
