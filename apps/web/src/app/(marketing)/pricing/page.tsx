import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { PricingClient } from "@/components/marketing/pricing-client";

export const metadata = createSiteMetadata({
  title: "Pricing Plans — Transparent BDT Rates for BornoLand",
  description:
    "Explore BornoLand subscription plans. Transparent pricing with all core modules included — eCommerce, POS, Inventory, HRM, Payroll, and Accounting.",
  path: "/pricing",
  keywords: [
    "BornoLand pricing",
    "POS software price Bangladesh",
    "ecommerce software pricing",
    "ERP subscription plans",
  ],
});

export default function PricingPage() {
  return <PricingClient />;
}
