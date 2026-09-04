import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { HelpCenterClient } from "@/components/help/help-center-client";

export const metadata = createSiteMetadata({
  title: "Help Center — BornoLand",
  description: "Browse help categories, tutorials, and support articles for BornoLand.",
  path: "/help-center",
});

export default function HelpCenterAliasPage() {
  return <HelpCenterClient />;
}
