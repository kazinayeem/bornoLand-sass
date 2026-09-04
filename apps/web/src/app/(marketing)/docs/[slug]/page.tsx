import { notFound } from "next/navigation";
import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { DocsShell } from "@/components/docs/docs-shell";
import { DOCS_REGISTRY } from "@/lib/docs-data";

interface DocPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DOCS_REGISTRY.map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = DOCS_REGISTRY.find((d) => d.slug === slug);

  if (!doc) {
    return createSiteMetadata({
      title: "Doc Not Found",
      description: "The requested documentation page could not be located.",
      path: `/docs/${slug}`,
    });
  }

  return createSiteMetadata({
    title: `${doc.title} — Documentation`,
    description: doc.summary,
    path: `/docs/${doc.slug}`,
    keywords: ["BornoLand docs", doc.title, doc.category, "business OS"],
  });
}

export default async function DynamicDocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = DOCS_REGISTRY.find((d) => d.slug === slug);

  if (!doc) {
    notFound();
  }

  return <DocsShell currentTopic={doc} />;
}
