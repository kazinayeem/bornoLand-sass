import { redirect } from "next/navigation";

type BuilderIndexPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function BuilderIndexPage({ params }: BuilderIndexPageProps) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/builder/home`);
}
