import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { BlogPageContent } from "@/components/site/blog-page-content";

export const metadata = createSiteMetadata({
  title: "Blog",
  description:
    "Guides, product updates, and ecommerce insights from BornoLand — payments, inventory, Bangladesh market trends, and growing your online store.",
  path: "/blog",
  keywords: [
    "BornoLand blog",
    "Bangladesh ecommerce",
    "online store tips",
    "payment gateway guides",
    "inventory management",
  ],
});

export default function BlogPage() {
  return <BlogPageContent />;
}
