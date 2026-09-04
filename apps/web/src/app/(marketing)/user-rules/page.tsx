import React from "react";
import Link from "next/link";
import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { LegalDocument } from "@/components/site/legal-document";

export const metadata = createSiteMetadata({
  title: "User Rules & Platform Acceptable Use Policy",
  description:
    "Read the platform guidelines, account responsibilities, prohibited activities, and acceptable use policies for merchants and team members using BornoLand.",
  path: "/user-rules",
  keywords: [
    "BornoLand user rules",
    "acceptable use policy",
    "platform rules",
    "merchant guidelines",
  ],
});

const LAST_UPDATED = "September 4, 2026";

export default function UserRulesPage() {
  return (
    <LegalDocument
      eyebrow="Platform Guidelines"
      title="User Rules & Acceptable Use Policy"
      description="These rules govern the acceptable conduct of merchants, store operators, cashiers, and third-party integrations using the BornoLand Business Operating System."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "overview",
          title: "1. Overview & Scope",
          content: (
            <>
              <p>
                BornoLand (&quot;Platform,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to maintaining a secure, reliable, and lawful commerce environment for businesses in Bangladesh and worldwide.
              </p>
              <p>
                This Acceptable Use Policy (&quot;User Rules&quot;) applies to all registered workspace owners, store administrators, cashier staff, employees, and developers interacting with our platform, APIs, storefronts, and POS registers.
              </p>
              <p className="font-semibold text-amber-900 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Notice: This document provides operational guidelines for platform usage and does not constitute formal legal advice. For binding contractual terms, please review our <Link href="/terms" className="underline font-bold">Terms of Service</Link>.
              </p>
            </>
          ),
        },
        {
          id: "account-responsibility",
          title: "2. Account & Registration Responsibility",
          content: (
            <>
              <p>When creating and maintaining a BornoLand merchant account, you agree to:</p>
              <ul>
                <li>Provide accurate, truthful, and complete business identity and contact information.</li>
                <li>Maintain the confidentiality of your master login credentials, API secrets, and recovery keys.</li>
                <li>Immediately notify BornoLand at <a href="mailto:security@bornoland.com" className="text-primary underline">security@bornoland.com</a> if you suspect unauthorized access to your account.</li>
                <li>Ensure that all team members assigned store roles understand their operational security responsibilities.</li>
              </ul>
            </>
          ),
        },
        {
          id: "store-ownership-employees",
          title: "3. Store Ownership & Employee Access Scoping",
          content: (
            <>
              <p>
                Store owners must implement the principle of least privilege. Cashiers, floor staff, and branch managers should only be granted access to the modules and outlet registers required to perform their daily duties.
              </p>
              <ul>
                <li>Do not share single user accounts across multiple physical store cashiers.</li>
                <li>Revoke employee accounts immediately upon staff termination or role reassignment.</li>
                <li>Ensure accurate biometric attendance and payroll logs are recorded without falsification.</li>
              </ul>
            </>
          ),
        },
        {
          id: "prohibited-activities",
          title: "4. Prohibited Commercial Activities",
          content: (
            <>
              <p>You may NOT use BornoLand storefronts, POS terminals, or inventory services to sell, distribute, or promote:</p>
              <ul>
                <li>Counterfeit merchandise, pirated digital media, or items infringing third-party intellectual property.</li>
                <li>Illegal narcotics, prescription pharmaceuticals without valid domestic regulatory licensing, or controlled chemical substances.</li>
                <li>Firearms, munitions, explosives, or hazardous contraband prohibited by Bangladesh law.</li>
                <li>Deceptive, fraudulent, or predatory business schemes, pyramid systems, or unauthorized lottery operations.</li>
                <li>Hate speech, sexually explicit content, harassment, or materials inciting violence.</li>
              </ul>
            </>
          ),
        },
        {
          id: "system-security-abuse",
          title: "5. Platform Security & Abuse Prevention",
          content: (
            <>
              <p>Users are strictly prohibited from compromising platform infrastructure, including:</p>
              <ul>
                <li>Attempting unauthorized penetration testing, vulnerability scanning, or denial-of-service (DoS) attacks.</li>
                <li>Circumventing rate limits, API quotas, or payment verification workflows.</li>
                <li>Scraping competitor store catalogs, pricing matrices, or employee records using automated bots.</li>
                <li>Embedding malicious JavaScript, tracking spyware, or unauthorized redirects into custom storefront themes.</li>
              </ul>
            </>
          ),
        },
        {
          id: "data-privacy-responsibility",
          title: "6. Customer Data & Privacy Responsibility",
          content: (
            <>
              <p>
                As a merchant, you act as the data controller for your shoppers and employees. You must comply with all applicable privacy regulations and our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
              </p>
              <ul>
                <li>Never export customer phone numbers or email addresses to spam unconsenting recipients.</li>
                <li>Honor customer requests for data deletion or communication opt-outs promptly.</li>
                <li>Store physical paper invoices and customer receipts securely against unauthorized theft.</li>
              </ul>
            </>
          ),
        },
        {
          id: "enforcement-termination",
          title: "7. Violations, Suspension & Termination",
          content: (
            <>
              <p>
                BornoLand reserves the right to investigate suspected violations of these User Rules. In the event of a verified breach, we may take appropriate actions, including:
              </p>
              <ul>
                <li>Issuing formal warnings or requiring corrective inventory removals.</li>
                <li>Temporarily freezing storefront checkouts or POS register operations.</li>
                <li>Permanently terminating merchant workspaces involved in deliberate fraud or unlawful activities.</li>
                <li>Reporting criminal misconduct to appropriate law enforcement authorities when mandated by legal statute.</li>
              </ul>
            </>
          ),
        },
        {
          id: "reporting-abuse",
          title: "8. Reporting Abuse & Contact Support",
          content: (
            <>
              <p>
                If you encounter a BornoLand store or merchant violating these rules, please submit a report to our Trust &amp; Safety team:
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:abuse@bornoland.com" className="text-primary underline">abuse@bornoland.com</a>
                <br />
                <strong>Support Desk:</strong> <Link href="/contact" className="text-primary underline">Contact BornoLand Support</Link>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
