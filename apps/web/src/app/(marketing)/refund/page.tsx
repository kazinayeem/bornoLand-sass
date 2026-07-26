import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { LegalDocument } from "@/components/site/legal-document";

export const metadata = createSiteMetadata({
  title: "Refund Policy",
  description:
    "Understand BornoLand refund eligibility, time limits, non-refundable items, subscription refunds, cancellation, and how to request a refund.",
  path: "/refund",
  keywords: [
    "BornoLand refund",
    "refund policy",
    "subscription refund",
    "cancellation",
    "billing support",
  ],
});

const LAST_UPDATED = "July 24, 2026";

export default function RefundPage() {
  return (
    <LegalDocument
      eyebrow="Legal"
      title="Refund Policy"
      description="This Refund Policy explains when BornoLand subscription fees may be refunded, what is not eligible, and how to submit a refund request."
      lastUpdated={LAST_UPDATED}
      sections={[
        {
          id: "overview",
          title: "Overview",
          content: (
            <>
              <p>
                BornoLand (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
                wants merchants to feel confident investing in the Platform. This
                Policy applies to fees paid directly to BornoLand for Platform
                subscriptions and related billed services.
              </p>
              <p>
                It does not govern refunds for products sold through your
                storefront to your customers. Those sales are between you and
                your buyers under your own store policies.
              </p>
              <p>
                This Policy should be read together with our{" "}
                <a href="/terms">Terms of Service</a>. Where local consumer law
                requires greater protection, those rights prevail.
              </p>
            </>
          ),
        },
        {
          id: "eligibility",
          title: "Eligibility",
          content: (
            <>
              <p>
                You may request a refund when one or more of the following
                applies:
              </p>
              <ul>
                <li>
                  You were charged in error (duplicate charge, incorrect plan
                  amount, or billing after confirmed cancellation)
                </li>
                <li>
                  A paid subscription was purchased and you request a refund
                  within the time window below, subject to fair-use review
                </li>
                <li>
                  We are unable to provide a core paid feature that was
                  advertised for your plan due to a Platform failure lasting an
                  unreasonable period, after reasonable troubleshooting
                </li>
              </ul>
              <p>
                Refund eligibility is evaluated based on account history, usage,
                plan type, and the reason provided. Abuse of refund requests may
                result in denial and account restrictions.
              </p>
            </>
          ),
        },
        {
          id: "time-limits",
          title: "Time Limits",
          content: (
            <>
              <p>
                Unless a longer period is required by applicable law:
              </p>
              <ul>
                <li>
                  <strong>New paid subscriptions:</strong> refund requests must
                  be submitted within fourteen (14) days of the initial charge
                  for that paid plan
                </li>
                <li>
                  <strong>Billing errors:</strong> report within thirty (30) days
                  of the charge appearing on your statement or invoice
                </li>
                <li>
                  <strong>Renewal charges:</strong> if you cancel before renewal
                  but are still charged, contact us within fourteen (14) days of
                  the renewal charge
                </li>
              </ul>
              <p>
                Requests submitted after these windows are generally not
                eligible, except at our sole discretion or where mandatory law
                requires otherwise.
              </p>
            </>
          ),
        },
        {
          id: "non-refundable",
          title: "Non-Refundable Items",
          content: (
            <>
              <p>The following are typically non-refundable:</p>
              <ul>
                <li>
                  Fees for periods already consumed after the eligible refund
                  window
                </li>
                <li>
                  Add-ons, usage overages, or one-time services marked as
                  non-refundable at purchase
                </li>
                <li>
                  Domain registration, third-party app fees, or marketplace
                  charges billed by other providers
                </li>
                <li>
                  Free-plan upgrades that were converted with clear notice and
                  used extensively beyond a fair evaluation period
                </li>
                <li>
                  Charges resulting from failure to cancel before renewal when
                  cancellation controls were available in your account
                </li>
                <li>
                  Accounts terminated for Terms violations, fraud, or abuse
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "refund-process",
          title: "Refund Process",
          content: (
            <>
              <p>To request a refund:</p>
              <ol>
                <li>
                  Email{" "}
                  <a href="mailto:support@bornoland.com">
                    support@bornoland.com
                  </a>{" "}
                  or open a request via <a href="/support">Support</a>
                </li>
                <li>
                  Include your account email, workspace or store name, invoice
                  or transaction ID, and a clear reason for the request
                </li>
                <li>
                  Our billing team reviews eligibility and may ask for
                  additional details
                </li>
                <li>
                  If approved, we issue the refund to the original payment
                  method where possible
                </li>
              </ol>
              <p>
                Do not dispute a charge with your bank before contacting us;
                chargebacks for eligible issues can delay resolution and may
                lead to temporary account holds while we investigate.
              </p>
            </>
          ),
        },
        {
          id: "processing-time",
          title: "Processing Time",
          content: (
            <>
              <p>
                Approved refunds are typically initiated within five to ten (5–10)
                business days after approval. The time for funds to appear on
                your statement depends on your bank or payment provider and may
                take additional business days.
              </p>
              <p>
                We will confirm by email when a refund has been initiated. If
                you do not see the credit within your provider&apos;s normal
                window, reply to the confirmation with your payment receipt so
                we can follow up.
              </p>
            </>
          ),
        },
        {
          id: "subscription-refunds",
          title: "Subscription Refunds",
          content: (
            <>
              <h3>Monthly plans</h3>
              <p>
                Eligible monthly subscription refunds are generally issued for
                the most recent billing cycle charge when requested within the
                stated time limit and usage remains within fair-use guidelines.
              </p>
              <h3>Annual plans</h3>
              <p>
                Annual plans may qualify for a partial or full refund within the
                initial fourteen (14) day window. After that window, annual fees
                are ordinarily non-refundable for the remaining unused months,
                except for documented billing errors or as required by law.
              </p>
              <h3>Plan changes</h3>
              <p>
                When you upgrade, any proration is handled according to your
                billing settings. Downgrades take effect at period end unless
                otherwise stated; we do not refund the difference for unused
                higher-tier features mid-cycle except where this Policy or law
                requires it.
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
                Cancelling your subscription stops future renewals. Cancellation
                alone does not automatically create a refund. You generally
                retain access through the end of the paid period already billed.
              </p>
              <p>
                You can cancel from account billing settings. If you cannot
                access your account, contact support with proof of ownership and
                we will assist.
              </p>
              <p>
                After cancellation, export any store data you need. Data
                retention after cancellation follows our{" "}
                <a href="/privacy">Privacy Policy</a>.
              </p>
            </>
          ),
        },
        {
          id: "exceptions",
          title: "Exceptions",
          content: (
            <>
              <p>
                We may grant exceptions in limited cases, including:
              </p>
              <ul>
                <li>Documented prolonged Platform outages affecting paid use</li>
                <li>
                  Clear evidence of unauthorized account access resulting in
                  unintended purchases (subject to investigation)
                </li>
                <li>
                  Mandatory consumer-protection rights in your jurisdiction
                </li>
                <li>
                  Goodwill adjustments at our sole discretion
                </li>
              </ul>
              <p>
                Exceptional refunds do not create a precedent or obligation for
                future claims.
              </p>
            </>
          ),
        },
        {
          id: "support-contact",
          title: "Support Contact",
          content: (
            <>
              <p>
                For refund or billing questions:
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
              <p>
                Include &quot;Refund request&quot; in the subject line to help
                us route your message quickly.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
