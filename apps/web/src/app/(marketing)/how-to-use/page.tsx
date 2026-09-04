import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { HowToUseClient } from "@/components/how-to-use/how-to-use-client";

export const metadata = createSiteMetadata({
  title: "How to Use BornoLand — 16-Step Beginner Guide",
  description:
    "A step-by-step onboarding walkthrough for BornoLand. Learn how to create workspaces, configure stores, add products, set up multi-warehouse inventory, operate POS registers, and automate payroll.",
  path: "/how-to-use",
  keywords: [
    "how to use BornoLand",
    "BornoLand tutorial",
    "ecommerce setup guide",
    "POS tutorial",
    "inventory guide",
    "payroll onboarding",
  ],
});

export default function HowToUsePage() {
  return <HowToUseClient />;
}
