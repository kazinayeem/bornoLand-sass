type BuilderPageSlugProps = {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
};

export default async function BuilderPageSlugPage({ params }: BuilderPageSlugProps) {
  const { storeSlug, pageSlug } = await params;
  const { default: BuilderEditorPage } = await import("./editor-client");
  return <BuilderEditorPage pageSlug={pageSlug} storeSlug={storeSlug} />;
}
