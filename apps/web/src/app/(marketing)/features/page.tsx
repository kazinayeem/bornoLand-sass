import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { FeaturesClient } from "@/components/marketing/features-client";

export const metadata = createSiteMetadata({
  title: "Features & Modules — BornoLand Business OS",
  description:
    "Explore the complete suite of BornoLand features: Digital Storefronts, Cloud POS Registers, Multi-Warehouse Inventory, Biometric HRM, Automated Payroll, and Double-Entry Accounting.",
  path: "/features",
  keywords: [
    "BornoLand features",
    "POS software Bangladesh",
    "ecommerce platform",
    "inventory management",
    "payroll software",
    "accounting software",
  ],
});

export default function FeaturesPage() {
  return <FeaturesClient />;
}
