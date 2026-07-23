import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { DocsPageContent } from "@/components/site/docs-page-content";

export const metadata = createSiteMetadata({
  title: "Documentation",
  description:
    "BornoLand developer and merchant documentation — get started, authenticate, configure your store, call the API, and deploy with confidence.",
  path: "/docs",
  keywords: [
    "BornoLand docs",
    "ecommerce API",
    "store documentation",
    "Bangladesh ecommerce platform",
    "BornoLand SDK",
  ],
});

export default function DocsPage() {
  return <DocsPageContent />;
}
