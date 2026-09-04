import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { IntegrationsClient } from "@/components/marketing/integrations-client";

export const metadata = createSiteMetadata({
  title: "Integrations — Payment Gateways, Couriers & POS Hardware",
  description:
    "Explore pre-built integrations for BornoLand: bKash, Nagad, Pathao, Steadfast, RedX, SSL Wireless, ZKTeco biometric timeclocks, and ESC/POS thermal printers.",
  path: "/integrations",
  keywords: [
    "bKash integration",
    "Nagad payment gateway",
    "Pathao courier API",
    "Steadfast courier integration",
    "ZKTeco attendance sync",
  ],
});

export default function IntegrationsPage() {
  return <IntegrationsClient />;
}
