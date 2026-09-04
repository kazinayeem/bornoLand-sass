import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { SolutionsClient } from "@/components/marketing/solutions-client";

export const metadata = createSiteMetadata({
  title: "Industry Solutions — BornoLand Business OS",
  description:
    "Tailored solutions for Multi-Branch Retail, Fashion & Apparel, Electronics & Gadget Outlets, and B2B Wholesale Distribution.",
  path: "/solutions",
  keywords: [
    "retail software",
    "fashion POS Bangladesh",
    "electronics inventory",
    "wholesale ERP",
  ],
});

export default function SolutionsPage() {
  return <SolutionsClient />;
}
