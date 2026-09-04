import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { HelpCenterClient } from "@/components/help/help-center-client";

export const metadata = createSiteMetadata({
  title: "Help Center & Knowledge Base — BornoLand",
  description:
    "Find answers to common merchant questions, hardware tutorials, billing guidance, and technical help articles for BornoLand.",
  path: "/help",
  keywords: [
    "BornoLand help center",
    "customer support",
    "merchant knowledge base",
    "POS troubleshooting",
  ],
});

export default function HelpPage() {
  return <HelpCenterClient />;
}
