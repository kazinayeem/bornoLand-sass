import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { AboutPageContent } from "@/components/site/about-page-content";

export const metadata = createSiteMetadata({
  title: "About Us",
  description:
    "Learn about BornoLand — the ecommerce SaaS platform helping merchants in Bangladesh and beyond launch, grow, and scale online stores with confidence.",
  path: "/about",
  keywords: [
    "BornoLand",
    "about BornoLand",
    "ecommerce SaaS",
    "online store platform",
    "Bangladesh ecommerce",
  ],
});

export default function AboutPage() {
  return <AboutPageContent />;
}
