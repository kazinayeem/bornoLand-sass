import { redirect } from "next/navigation";

type BuilderPageSlugProps = {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
};

export default async function BuilderPageSlugRedirect({ params }: BuilderPageSlugProps) {
  const { storeSlug, pageSlug } = await params;
  if (pageSlug !== "home") {
    redirect(`/store/${storeSlug}/builder/home`);
  }

  const { default: BuilderEditorPage } = await import("./editor-client");
  return <BuilderEditorPage />;
}
