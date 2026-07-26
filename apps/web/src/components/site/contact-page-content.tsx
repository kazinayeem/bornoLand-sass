"use client";

import Link from "next/link";
import {
  Clock3,
  Facebook,
  Headphones,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  Twitter,
} from "lucide-react";
import { SitePageHero } from "@/components/site/site-page-hero";
import { SiteSection } from "@/components/site/site-section";
import { SiteCtaBanner } from "@/components/site/site-cta-banner";
import { ContactForm } from "@/components/site/contact-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { LandingReveal } from "@/components/landing/landing-ui";
import { cn } from "@/lib/utils";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    lines: ["+880 1700-000000", "Sat–Thu, 10:00–18:00 BST"],
    href: "tel:+8801700000000",
    linkLabel: "Call us",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["hello@bornoland.com", "support@bornoland.com"],
    href: "mailto:hello@bornoland.com",
    linkLabel: "Send email",
  },
  {
    icon: MapPin,
    title: "Office",
    lines: ["Level 5, Digital Commerce Hub", "Gulshan, Dhaka 1212, Bangladesh"],
    href: "#map",
    linkLabel: "View map",
  },
  {
    icon: Clock3,
    title: "Business hours",
    lines: ["Saturday – Thursday", "10:00 AM – 6:00 PM (BST)"],
    href: undefined,
    linkLabel: undefined,
  },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: Linkedin,
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com",
    icon: Twitter,
  },
];

export function ContactPageContent() {
  return (
    <>
      <SitePageHero
        eyebrow="Contact"
        title="Let’s talk about your store"
        description="Whether you need sales guidance, onboarding help, or partnership details — the BornoLand team is here. Reach out and we will respond within one business day."
        primaryCta={{ label: "Start free trial", href: "/register" }}
        secondaryCta={{ label: "Browse FAQ", href: "/faq", variant: "outline" }}
      />

      <SiteSection
        id="contact-info"
        eyebrow="Reach us"
        title="Contact information"
        description="Choose the channel that fits — phone, email, or a visit during business hours."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((item, index) => (
            <LandingReveal key={item.title} delay={index * 0.04}>
              <Card className="h-full rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="space-y-1 text-sm leading-relaxed">
                    {item.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </CardDescription>
                  {item.href && item.linkLabel ? (
                    <Link
                      href={item.href}
                      className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
                    >
                      {item.linkLabel}
                    </Link>
                  ) : null}
                </CardHeader>
              </Card>
            </LandingReveal>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        id="contact-form"
        eyebrow="Message"
        title="Send us a message"
        description="Share a few details and our team will follow up with next steps."
        alt
        align="left"
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <LandingReveal>
            <Card className="rounded-apple-xl border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Contact form</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Fields marked with * are required. We never share your details
                  with third parties for marketing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </LandingReveal>

          <div className="space-y-5">
            <LandingReveal delay={0.05}>
              <Card className="rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Headphones className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">Response time</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Most inquiries receive a reply within one business day. Sales
                    and onboarding requests are prioritized during peak hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="success" className="rounded-pill">
                    Typical reply: under 24 hours
                  </Badge>
                </CardContent>
              </Card>
            </LandingReveal>

            <LandingReveal delay={0.08}>
              <Card className="rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <ShieldAlert className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">Emergency contact</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    For urgent production issues affecting live stores, email{" "}
                    <a
                      href="mailto:urgent@bornoland.com"
                      className="font-semibold text-foreground underline underline-offset-2"
                    >
                      urgent@bornoland.com
                    </a>{" "}
                    with your store URL and a short incident summary.
                  </CardDescription>
                </CardHeader>
              </Card>
            </LandingReveal>

            <LandingReveal delay={0.1}>
              <Card className="rounded-apple-xl border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">Prefer self-serve?</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    Browse answers on billing, features, and account setup before
                    you write in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link
                    href="/faq"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-pill font-semibold",
                    )}
                  >
                    Go to FAQ
                  </Link>
                </CardContent>
              </Card>
            </LandingReveal>
          </div>
        </div>
      </SiteSection>

      <SiteSection
        id="map"
        eyebrow="Location"
        title="Visit our office"
        description="Find us in Gulshan, Dhaka — or meet virtually if that works better for your team."
      >
        <LandingReveal>
          <Card className="overflow-hidden rounded-apple-xl border-border bg-card shadow-sm">
            <div
              className="relative min-h-[240px] overflow-hidden bg-gradient-to-br from-muted via-secondary to-muted sm:min-h-[320px]"
              role="img"
              aria-label="Map placeholder showing BornoLand office area in Gulshan, Dhaka"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50"
                aria-hidden
              />
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-sm rounded-apple-xl border border-border bg-card/95 p-5 text-center shadow-lg backdrop-blur-sm">
                  <MapPin className="mx-auto mb-2 h-6 w-6 text-primary" aria-hidden />
                  <p className="text-sm font-bold text-foreground">
                    BornoLand HQ
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Level 5, Digital Commerce Hub
                    <br />
                    Gulshan, Dhaka 1212
                  </p>
                  <Badge variant="primary" className="mt-3 rounded-pill">
                    Map preview
                  </Badge>
                </div>
              </div>
            </div>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Interactive map embed can be connected later. This preview marks
                our Dhaka office for visitors and partners.
              </p>
              <a
                href="https://maps.google.com/?q=Gulshan+Dhaka"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "shrink-0 rounded-pill font-semibold",
                )}
              >
                Open in Maps
              </a>
            </CardContent>
          </Card>
        </LandingReveal>
      </SiteSection>

      <SiteSection
        id="social"
        eyebrow="Community"
        title="Follow BornoLand"
        description="Product updates, merchant stories, and platform tips across our channels."
        alt
      >
        <LandingReveal>
          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-pill font-semibold",
                )}
                aria-label={`BornoLand on ${item.label}`}
              >
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </a>
            ))}
          </div>
        </LandingReveal>
        <Separator className="mx-auto mt-10 max-w-md" />
        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-muted-foreground">
          Looking for help articles first?{" "}
          <Link href="/faq" className="font-semibold text-primary hover:underline">
            Visit the FAQ
          </Link>{" "}
          or start building at{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            /register
          </Link>
          .
        </p>
      </SiteSection>

      <SiteCtaBanner
        title="Prefer to explore first?"
        description="Create a free BornoLand account, preview the dashboard, and launch when you are ready — no long sales cycle required."
        primaryLabel="Create account"
        primaryHref="/register"
        secondaryLabel="Back to home"
        secondaryHref="/"
      />
    </>
  );
}
