import { redirect } from "next/navigation";

type LegacyThemeRedirectProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function LegacyAppearanceThemeRedirect({ params }: LegacyThemeRedirectProps) {
  const { storeSlug } = await params;
  redirect(`/store/${storeSlug}/theme`);
}
