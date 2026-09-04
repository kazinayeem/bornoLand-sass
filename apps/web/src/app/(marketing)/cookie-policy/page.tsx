import React from "react";
import Link from "next/link";
import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { LegalDocument } from "@/components/site/legal-document";

export const metadata = createSiteMetadata({
  title: "Cookie Policy — BornoLand",
  description:
    "Learn how BornoLand uses essential, functional, and analytics cookies to deliver secure authentication, shopping carts, and POS operations.",
  path: "/cookie-policy",
  keywords: ["BornoLand cookies", "cookie policy", "browser cookies", "privacy"],
});

const LAST_UPDATED = "September 4, 2026";

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Cookie Policy"
      description="This policy explains what cookies are, how BornoLand utilizes them across public pages, merchant dashboards, and storefronts, and how you can manage your preferences."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "what-are-cookies",
          title: "1. What Are Cookies?",
          content: (
            <>
              <p>
                Cookies are small text files placed on your computer, tablet, or mobile device by websites you visit. They are widely used to make websites work properly, enhance security, and remember your login preferences.
              </p>
            </>
          ),
        },
        {
          id: "cookies-we-use",
          title: "2. Categories of Cookies We Use",
          content: (
            <>
              <h3>A. Strictly Essential Cookies</h3>
              <p>
                These cookies are necessary for core platform security, authenticating dashboard sessions, remembering active workspace selections, and processing checkout shopping carts. Without these, the platform cannot function safely.
              </p>

              <h3>B. Functional &amp; Preference Cookies</h3>
              <p>
                These cookies store your selected interface language (English or Bangla), dark/light mode display preferences, and POS cashier station identifiers.
              </p>

              <h3>C. Performance &amp; Analytics Cookies</h3>
              <p>
                We use aggregated, anonymized telemetry cookies to monitor server response latencies, identify broken navigation links, and optimize dashboard speed.
              </p>
            </>
          ),
        },
        {
          id: "managing-cookies",
          title: "3. Managing Your Cookie Preferences",
          content: (
            <>
              <p>
                Most modern web browsers allow you to control cookies through their settings. You can choose to block or delete cookies; however, blocking essential cookies will prevent you from signing in to the merchant dashboard or completing online purchases.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "4. Inquiries & Privacy Contact",
          content: (
            <>
              <p>
                If you have questions regarding our cookie practices, please review our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> or email our Data Protection team at <a href="mailto:privacy@bornoland.com" className="text-primary underline">privacy@bornoland.com</a>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
