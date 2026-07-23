import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { LegalDocument } from "@/components/site/legal-document";

export const metadata = createSiteMetadata({
  title: "Privacy Policy",
  description:
    "Learn how BornoLand collects, uses, stores, and protects personal data across our ecommerce SaaS platform, including cookies, analytics, and your privacy rights.",
  path: "/privacy",
  keywords: [
    "BornoLand privacy",
    "privacy policy",
    "GDPR",
    "data protection",
    "ecommerce SaaS privacy",
  ],
});

const LAST_UPDATED = "July 24, 2026";

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      description="This Privacy Policy explains how BornoLand collects, uses, shares, and protects personal information when you use our ecommerce platform and related services."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "introduction",
          title: "Introduction",
          content: (
            <>
              <p>
                BornoLand (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                respects your privacy. This Policy applies to merchants,
                account users, website visitors, and other individuals whose
                information we process in connection with the Platform.
              </p>
              <p>
                If you operate a store on BornoLand, you are typically the
                controller of your customers&apos; data, and we act as a
                processor/service provider to host and process that data on your
                instructions. Your storefront should present its own privacy
                notice to end customers where required.
              </p>
              <p>
                By using the Service, you acknowledge this Policy. For related
                contractual terms, see our <a href="/terms">Terms of Service</a>.
              </p>
            </>
          ),
        },
        {
          id: "information-collection",
          title: "Information We Collect",
          content: (
            <>
              <h3>Information you provide</h3>
              <ul>
                <li>
                  Account details such as name, email, phone, password, and
                  business information
                </li>
                <li>
                  Billing and payment details processed via our payment partners
                </li>
                <li>
                  Store content you upload, including product data, media, and
                  customer records you import
                </li>
                <li>
                  Support communications, feedback, and form submissions
                </li>
              </ul>
              <h3>Information collected automatically</h3>
              <ul>
                <li>
                  Device and browser information, IP address, approximate
                  location, and usage logs
                </li>
                <li>
                  Diagnostic data, performance metrics, and security event logs
                </li>
                <li>
                  Referral URLs and pages visited on our marketing and product
                  sites
                </li>
              </ul>
              <h3>Information from third parties</h3>
              <p>
                We may receive information from payment processors,
                authentication providers, domain/DNS partners, analytics tools,
                and other services you connect to your workspace, consistent with
                their policies and your configuration.
              </p>
            </>
          ),
        },
        {
          id: "how-we-use",
          title: "How We Use Information",
          content: (
            <>
              <p>We use personal information to:</p>
              <ul>
                <li>
                  Provide, operate, secure, and improve the BornoLand Platform
                </li>
                <li>
                  Create and manage accounts, workspaces, and subscriptions
                </li>
                <li>
                  Process payments, invoices, and plan changes
                </li>
                <li>
                  Deliver transactional emails and, where permitted, product
                  updates or marketing communications
                </li>
                <li>
                  Provide customer support and respond to requests
                </li>
                <li>
                  Detect abuse, prevent fraud, and enforce our Terms
                </li>
                <li>
                  Comply with legal obligations and resolve disputes
                </li>
              </ul>
              <p>
                Where GDPR or similar laws apply, we rely on one or more lawful
                bases such as contract performance, legitimate interests
                (balanced against your rights), consent, or legal obligation.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies and Similar Technologies",
          content: (
            <>
              <p>
                We use cookies, local storage, and similar technologies to keep
                you signed in, remember preferences, measure performance, and
                understand how the Service is used.
              </p>
              <ul>
                <li>
                  <strong>Essential cookies</strong> — required for
                  authentication, security, and core functionality
                </li>
                <li>
                  <strong>Preference cookies</strong> — remember language,
                  locale, or UI choices
                </li>
                <li>
                  <strong>Analytics cookies</strong> — help us understand usage
                  patterns and improve the product
                </li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling
                certain cookies may affect login or feature availability.
              </p>
            </>
          ),
        },
        {
          id: "analytics",
          title: "Analytics",
          content: (
            <>
              <p>
                We may use first-party and third-party analytics to measure
                traffic, feature adoption, and reliability. Analytics data is
                used in aggregate where practical and helps us prioritize
                improvements, fix bugs, and evaluate marketing effectiveness.
              </p>
              <p>
                Where required, we configure analytics tools to respect
                regional requirements and minimize unnecessary identifiers.
              </p>
            </>
          ),
        },
        {
          id: "third-party",
          title: "Third-Party Services",
          content: (
            <>
              <p>
                BornoLand integrates with carefully selected service providers,
                which may include:
              </p>
              <ul>
                <li>Cloud hosting and infrastructure providers</li>
                <li>Payment and billing processors</li>
                <li>Email delivery and customer messaging tools</li>
                <li>Analytics, error monitoring, and security services</li>
                <li>
                  Domain, CDN, or media storage partners you enable
                </li>
              </ul>
              <p>
                These providers process data only as needed to perform services
                for us or on your behalf and are bound by contractual
                confidentiality and data-protection obligations where
                applicable. Third-party sites linked from the Platform have
                their own privacy practices; we are not responsible for their
                content or policies.
              </p>
            </>
          ),
        },
        {
          id: "security",
          title: "Security",
          content: (
            <>
              <p>
                We implement administrative, technical, and organizational
                measures designed to protect personal information, including
                access controls, encryption in transit where appropriate,
                monitoring, and staff awareness practices.
              </p>
              <p>
                No method of transmission or storage is completely secure. You
                are responsible for safeguarding your credentials and
                configuring your store, team permissions, and integrations
                carefully. Report suspected security incidents to{" "}
                <a href="mailto:support@bornoland.com">support@bornoland.com</a>{" "}
                promptly.
              </p>
            </>
          ),
        },
        {
          id: "user-rights",
          title: "Your Rights",
          content: (
            <>
              <p>
                Depending on your location (including under GDPR and similar
                frameworks), you may have rights to:
              </p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>
                  Request deletion, subject to legal or operational retention
                  needs
                </li>
                <li>
                  Object to or restrict certain processing, including marketing
                </li>
                <li>
                  Request data portability in a commonly used format
                </li>
                <li>
                  Withdraw consent where processing is based on consent
                </li>
                <li>
                  Lodge a complaint with a supervisory authority
                </li>
              </ul>
              <p>
                To exercise these rights, contact{" "}
                <a href="mailto:support@bornoland.com">support@bornoland.com</a>.
                We may need to verify your identity before fulfilling a request.
                If you are an end customer of a BornoLand store, please contact
                that store first, as the merchant typically controls your data.
              </p>
            </>
          ),
        },
        {
          id: "data-retention",
          title: "Data Retention",
          content: (
            <>
              <p>
                We retain personal information for as long as needed to provide
                the Service, comply with legal obligations, resolve disputes,
                enforce agreements, and maintain security records.
              </p>
              <p>
                Account and store data is generally retained while your account
                remains active. After cancellation or deletion requests, we may
                retain limited information in backups or logs for a reasonable
                period, then delete or anonymize it according to our retention
                schedules—unless a longer period is required by law.
              </p>
            </>
          ),
        },
        {
          id: "children",
          title: "Children's Privacy",
          content: (
            <>
              <p>
                BornoLand is directed to businesses and adults. We do not
                knowingly collect personal information from children under 16
                (or the higher age required in your region). If you believe a
                child has provided us personal data, contact us and we will take
                appropriate steps to delete it.
              </p>
            </>
          ),
        },
        {
          id: "international-transfers",
          title: "International Transfers",
          content: (
            <>
              <p>
                BornoLand operates with team members and infrastructure that may
                be located in Bangladesh and other countries. Your information
                may be transferred to and processed in locations outside your
                home country.
              </p>
              <p>
                Where required, we use appropriate safeguards for cross-border
                transfers—such as contractual clauses, vendor assessments, and
                security controls—to protect personal data in line with
                applicable law.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to This Policy",
          content: (
            <>
              <p>
                We may update this Privacy Policy periodically. Material changes
                will be reflected by revising the &quot;Last updated&quot; date
                and, when appropriate, by notice through the Service or email.
              </p>
              <p>
                We encourage you to review this page regularly. Continued use of
                BornoLand after an update indicates acknowledgment of the
                revised Policy, to the extent permitted by law.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          content: (
            <>
              <p>
                For privacy questions or data-subject requests:
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <a href="mailto:support@bornoland.com">
                    support@bornoland.com
                  </a>
                </li>
                <li>
                  Support center: <a href="/support">bornoland.com/support</a>
                </li>
                <li>Location: Dhaka, Bangladesh</li>
              </ul>
            </>
          ),
        },
      ]}
    />
  );
}
