import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { ContactPageContent } from "@/components/site/contact-page-content";

export const metadata = createSiteMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the BornoLand team. Sales, support, and partnership inquiries — we typically respond within one business day.",
  path: "/contact",
  keywords: [
    "BornoLand contact",
    "ecommerce support",
    "sales inquiry",
    "customer success",
  ],
});

export default function ContactPage() {
  return <ContactPageContent />;
}
