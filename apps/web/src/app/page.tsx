import type { Metadata } from "next";
import { LandingPageClient } from "@/components/landing/landing-page-client";

export const metadata: Metadata = {
  title: "BornoLand — One Powerful Platform for Your Entire Business",
  description:
    "The all-in-one Business Operating System (BOS) unifying storefront commerce, cloud POS, multi-warehouse inventory, audited payroll, double-entry accounting, and real-time business analytics.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "BornoLand — Everything Your Business Needs. One Powerful Platform.",
    description:
      "Run commerce, POS, inventory, HR, finance and operations from one connected platform.",
    url: "https://bornoland.com",
    siteName: "BornoLand",
    locale: "en_US",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "BornoLand",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description:
              "The all-in-one Business Operating System (BOS) for commerce, retail POS, inventory, accounting, and payroll.",
          }),
        }}
      />
      <LandingPageClient />
    </>
  );
}
