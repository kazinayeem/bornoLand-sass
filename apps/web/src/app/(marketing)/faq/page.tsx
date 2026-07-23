import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { FaqPageContent } from "@/components/site/faq-page-content";

export const metadata = createSiteMetadata({
  title: "FAQ",
  description:
    "Answers to common questions about BornoLand — billing, accounts, security, API access, technical setup, and support for your online store.",
  path: "/faq",
  keywords: [
    "BornoLand FAQ",
    "ecommerce help",
    "online store questions",
    "billing support",
    "Bangladesh SaaS",
  ],
});

export default function FaqPage() {
  return <FaqPageContent />;
}
