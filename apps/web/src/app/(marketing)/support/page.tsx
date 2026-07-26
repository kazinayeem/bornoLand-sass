import Link from "next/link";
import { BookOpen, HelpCircle, Mail, MessageSquare } from "lucide-react";
import { createSiteMetadata } from "@/components/site/create-site-metadata";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteSection } from "@/components/site/site-section";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = createSiteMetadata({
  title: "Support",
  description:
    "Get help with BornoLand — browse documentation, FAQs, or contact our support team.",
  path: "/support",
  keywords: ["BornoLand support", "help center", "documentation", "FAQ"],
});

const hubs = [
  {
    title: "Documentation",
    description: "Guides for setup, authentication, API, deployment, and troubleshooting.",
    href: "/docs",
    icon: BookOpen,
  },
  {
    title: "FAQ",
    description: "Answers about billing, accounts, security, API, and day-to-day store ops.",
    href: "/faq",
    icon: HelpCircle,
  },
  {
    title: "Contact support",
    description: "Reach our team by email or form. Typical response within one business day.",
    href: "/contact",
    icon: Mail,
  },
  {
    title: "Community & updates",
    description: "Product tips, ecommerce playbooks, and platform announcements on the blog.",
    href: "/blog",
    icon: MessageSquare,
  },
];

export default function SupportPage() {
  return (
    <>
      <SitePageHero
        eyebrow="Support"
        title="We’re here to help you ship and sell"
        description="Find answers fast in docs and FAQs, or talk to a human when you need a hand with your store."
        primaryCta={{ label: "Browse docs", href: "/docs" }}
        secondaryCta={{ label: "Contact us", href: "/contact", variant: "outline" }}
      />

      <SiteSection
        title="Support resources"
        description="Pick the path that fits — self-serve guides or direct support."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hubs.map((hub) => (
            <Link key={hub.href} href={hub.href} className="group block h-full">
              <Card className="h-full rounded-apple-xl border-border transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-apple-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <hub.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{hub.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {hub.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 text-sm font-semibold text-primary">
                  Open →
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SiteSection>

      <SiteCtaBanner
        title="Still stuck?"
        description="Tell us what’s blocking you — store setup, payments, domains, or billing — and we’ll help you move forward."
        primaryLabel="Contact support"
        primaryHref="/contact"
        secondaryLabel="Read FAQ"
        secondaryHref="/faq"
      />
    </>
  );
}
