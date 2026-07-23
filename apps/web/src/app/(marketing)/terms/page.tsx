import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { LegalDocument } from "@/components/site/legal-document";

export const metadata = createSiteMetadata({
  title: "Terms of Service",
  description:
    "Read the BornoLand Terms of Service covering accounts, subscriptions, payments, intellectual property, liability, and governing law in Bangladesh.",
  path: "/terms",
  keywords: [
    "BornoLand terms",
    "terms of service",
    "SaaS agreement",
    "ecommerce platform terms",
  ],
});

const LAST_UPDATED = "July 24, 2026";

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms of Service"
      description="These Terms govern your access to and use of the BornoLand platform, including storefronts, subscriptions, and related services."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "acceptance",
          title: "Acceptance of Terms",
          content: (
            <>
              <p>
                By creating an account, accessing, or using BornoLand
                (&quot;Platform,&quot; &quot;Service,&quot; &quot;we,&quot;
                &quot;us,&quot; or &quot;our&quot;), you agree to be bound by
                these Terms of Service (&quot;Terms&quot;). If you do not agree,
                do not use the Service.
              </p>
              <p>
                These Terms form a binding agreement between you (an individual
                or the entity you represent) and BornoLand. If you use the
                Service on behalf of a business, you confirm that you have
                authority to bind that business to these Terms.
              </p>
              <p>
                Supplemental policies—including our{" "}
                <a href="/privacy">Privacy Policy</a> and{" "}
                <a href="/refund">Refund Policy</a>—are incorporated by
                reference and form part of this agreement.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "Eligibility",
          content: (
            <>
              <p>To use BornoLand, you must:</p>
              <ul>
                <li>
                  Be at least 18 years old, or the age of majority in your
                  jurisdiction
                </li>
                <li>
                  Have the legal capacity to enter into a binding contract
                </li>
                <li>
                  Not be barred from using the Service under applicable law
                </li>
                <li>
                  Provide accurate registration and billing information
                </li>
              </ul>
              <p>
                We may refuse, suspend, or terminate access if we reasonably
                believe you do not meet these requirements or are using the
                Service in a prohibited manner.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "Accounts and Security",
          content: (
            <>
              <p>
                You are responsible for maintaining the confidentiality of your
                login credentials and for all activity under your account. Notify
                us promptly at{" "}
                <a href="mailto:support@bornoland.com">support@bornoland.com</a>{" "}
                if you suspect unauthorized access.
              </p>
              <h3>Account information</h3>
              <p>
                You agree to keep your profile, store details, and contact
                information accurate and up to date. False or incomplete
                information may result in suspension.
              </p>
              <h3>Workspaces and team access</h3>
              <p>
                If you invite team members, you remain responsible for their
                actions within your workspace. You must ensure each user has
                appropriate permissions and complies with these Terms.
              </p>
            </>
          ),
        },
        {
          id: "subscriptions",
          title: "Subscriptions and Plans",
          content: (
            <>
              <p>
                BornoLand offers free and paid subscription plans. Plan features,
                limits, and pricing are described on our pricing pages and may
                change from time to time. The plan you select determines the
                features, store limits, and support level available to you.
              </p>
              <h3>Trial and free plans</h3>
              <p>
                Where a trial or free tier is offered, we may limit features,
                usage, or duration. We may convert, downgrade, or discontinue
                trial access according to the terms presented at signup.
              </p>
              <h3>Upgrades and downgrades</h3>
              <p>
                You may change plans from your billing settings. Upgrades
                typically take effect immediately. Downgrades take effect at the
                end of the current billing period unless otherwise stated.
                Feature access and resource limits may change when you switch
                plans.
              </p>
            </>
          ),
        },
        {
          id: "payments",
          title: "Payments and Billing",
          content: (
            <>
              <p>
                Paid subscriptions are billed in advance on a recurring basis
                (monthly or annually, as selected). By providing a payment
                method, you authorize us and our payment processors to charge
                applicable fees, taxes, and related charges.
              </p>
              <ul>
                <li>
                  Fees are generally non-refundable except as stated in our{" "}
                  <a href="/refund">Refund Policy</a>
                </li>
                <li>
                  Failed payments may result in suspension or restricted access
                  until resolved
                </li>
                <li>
                  You are responsible for any taxes applicable to your purchase,
                  except taxes based on our income
                </li>
                <li>
                  Price changes will be communicated in advance where required
                  by law or these Terms
                </li>
              </ul>
              <p>
                Invoices and receipts are available in your account dashboard
                where billing history is enabled.
              </p>
            </>
          ),
        },
        {
          id: "cancellation",
          title: "Cancellation",
          content: (
            <>
              <p>
                You may cancel your paid subscription at any time from your
                account billing settings or by contacting support. Cancellation
                stops future renewals. Unless otherwise required by law or our
                Refund Policy, you retain access to paid features through the
                end of the then-current billing period.
              </p>
              <p>
                After cancellation or expiration, we may retain certain data as
                described in our Privacy Policy, and we may delete store content
                after a reasonable retention window. Export your data before
                cancelling if you need a local copy.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          title: "Intellectual Property",
          content: (
            <>
              <h3>Our rights</h3>
              <p>
                BornoLand, including its software, branding, documentation,
                templates, and design systems, is owned by us or our licensors.
                These Terms do not transfer ownership of any BornoLand
                intellectual property to you. You receive a limited,
                non-exclusive, non-transferable right to use the Service as
                permitted under your plan.
              </p>
              <h3>Your content</h3>
              <p>
                You retain ownership of content you upload or create in your
                stores (products, media, text, customer data you lawfully
                control, and similar materials) (&quot;Customer Content&quot;).
                You grant us a worldwide, non-exclusive license to host, process,
                display, and transmit Customer Content solely as needed to
                operate and improve the Service.
              </p>
              <p>
                You represent that you have all rights necessary to upload and
                use Customer Content and that it does not infringe third-party
                rights or applicable law.
              </p>
            </>
          ),
        },
        {
          id: "restrictions",
          title: "Acceptable Use and Restrictions",
          content: (
            <>
              <p>You agree not to:</p>
              <ul>
                <li>
                  Use the Service for unlawful, fraudulent, or harmful
                  activities
                </li>
                <li>
                  Sell or promote illegal goods, counterfeit products, or
                  prohibited categories
                </li>
                <li>
                  Reverse engineer, scrape, or interfere with Platform security
                  or availability
                </li>
                <li>
                  Abuse APIs, exceed rate limits, or attempt unauthorized access
                  to other accounts or systems
                </li>
                <li>
                  Upload malware, spam, or content that is defamatory, abusive,
                  or infringing
                </li>
                <li>
                  Misrepresent your identity, affiliation, or storefront
                  authenticity
                </li>
                <li>
                  Resell the Service itself without our prior written consent
                </li>
              </ul>
              <p>
                We may investigate violations and remove content, suspend
                accounts, or take other appropriate action.
              </p>
            </>
          ),
        },
        {
          id: "liability",
          title: "Disclaimers and Limitation of Liability",
          content: (
            <>
              <p>
                The Service is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis. To the fullest extent permitted by law, we
                disclaim warranties of merchantability, fitness for a particular
                purpose, and non-infringement. We do not guarantee uninterrupted
                or error-free operation, or that the Service will meet every
                business requirement.
              </p>
              <p>
                To the maximum extent permitted by applicable law, BornoLand and
                its directors, employees, and partners will not be liable for
                indirect, incidental, special, consequential, or punitive
                damages, or for lost profits, revenue, data, or business
                opportunities arising from your use of the Service.
              </p>
              <p>
                Our aggregate liability arising out of or relating to these Terms
                or the Service will not exceed the amounts you paid to BornoLand
                for the Service in the twelve (12) months preceding the claim,
                or one hundred US dollars (or equivalent) if you are on a free
                plan—whichever applies.
              </p>
              <p>
                Some jurisdictions do not allow certain limitations. In those
                cases, our liability is limited to the maximum extent permitted
                by law.
              </p>
            </>
          ),
        },
        {
          id: "termination",
          title: "Termination",
          content: (
            <>
              <p>
                We may suspend or terminate your access immediately if you
                materially breach these Terms, fail to pay fees when due, create
                risk for other users or the Platform, or if required by law. You
                may stop using the Service and cancel your account at any time.
              </p>
              <p>
                Upon termination, your right to use the Service ends. Provisions
                that by nature should survive—including intellectual property,
                disclaimers, limitation of liability, indemnification
                obligations, and governing law—will survive termination.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to These Terms",
          content: (
            <>
              <p>
                We may update these Terms to reflect product changes, legal
                requirements, or business practices. When we make material
                changes, we will update the &quot;Last updated&quot; date and,
                where appropriate, provide notice through the Service or by
                email.
              </p>
              <p>
                Continued use of BornoLand after changes become effective
                constitutes acceptance of the revised Terms. If you do not agree,
                you must stop using the Service and cancel your subscription.
              </p>
            </>
          ),
        },
        {
          id: "governing-law",
          title: "Governing Law",
          content: (
            <>
              <p>
                These Terms are governed by the laws of Bangladesh, without
                regard to conflict-of-law principles. Courts located in Dhaka,
                Bangladesh shall have exclusive jurisdiction over disputes
                arising from or relating to these Terms or the Service, except
                where mandatory consumer protections in your jurisdiction
                provide otherwise.
              </p>
              <p>
                Before filing a formal claim, you agree to contact us in good
                faith to attempt an informal resolution.
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
                Questions about these Terms may be sent to:
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <a href="mailto:support@bornoland.com">
                    support@bornoland.com
                  </a>
                </li>
                <li>
                  Support: <a href="/support">bornoland.com/support</a>
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
