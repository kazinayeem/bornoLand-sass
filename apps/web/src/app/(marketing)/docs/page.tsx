import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { DocsShell } from "@/components/docs/docs-shell";
import { DOCS_REGISTRY } from "@/lib/docs-data";

export const metadata = createSiteMetadata({
  title: "Documentation & Developer Guides",
  description:
    "Official documentation for BornoLand — master online storefronts, retail POS registers, multi-warehouse inventory, automated payroll, and accounting.",
  path: "/docs",
  keywords: [
    "BornoLand docs",
    "ecommerce documentation",
    "POS guide",
    "multi-warehouse inventory",
    "Bangladesh ERP",
  ],
});

export default function DocsPage() {
  const initialTopic = DOCS_REGISTRY[0];
  return <DocsShell currentTopic={initialTopic} />;
}
