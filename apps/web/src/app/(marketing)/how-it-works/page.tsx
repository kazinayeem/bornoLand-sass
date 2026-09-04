import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { HowItWorksClient } from "@/components/marketing/how-it-works-client";

export const metadata = createSiteMetadata({
  title: "How It Works — BornoLand Platform Architecture",
  description:
    "Learn how BornoLand connects customer orders, physical POS checkouts, warehouse stock, staff attendance, payroll, and executive accounting in real time.",
  path: "/how-it-works",
  keywords: [
    "how BornoLand works",
    "business operating system workflow",
    "omnichannel commerce",
    "POS and inventory integration",
  ],
});

export default function HowItWorksPage() {
  return <HowItWorksClient />;
}
