"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useLandingLocale } from "./landing-locale";
import { landingContainer } from "./landing-ui";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COPYRIGHT_YEAR = 2026;

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export function Footer() {
  const { t } = useLandingLocale();
  const f = t.footer;

  const footerLinks = [
    {
      title: f.product,
      links: [
        { label: f.links.features, href: "#features" },
        { label: f.links.builder, href: "#builder" },
        { label: f.links.pricing, href: "#pricing" },
      ],
    },
    {
      title: f.company,
      links: [
        { label: f.links.about, href: "/about" },
        { label: f.links.contact, href: "/contact" },
        { label: f.links.support, href: "/support" },
      ],
    },
    {
      title: f.resources,
      links: [
        { label: f.links.blog, href: "/blog" },
        { label: f.links.docs, href: "/docs" },
        { label: t.nav.faq, href: "#faq" },
      ],
    },
    {
      title: f.legal,
      links: [
        { label: f.links.terms, href: "/terms" },
        { label: f.links.privacy, href: "/privacy" },
        { label: f.links.refund, href: "/refund" },
      ],
    },
  ];

  return (
    <footer
      className={cn(
        "bg-apple-ink text-apple-on-dark",
        /* Override global `a { color: primary }` so footer matches dark theme */
        "[&_a]:text-apple-body-muted [&_a]:no-underline",
        "[&_a:hover]:text-apple-on-dark",
        "[&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-apple-primary-on-dark/40",
      )}
    >
      <div className={cn(landingContainer, "py-12 sm:py-16 md:py-20")}>
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:gap-8 sm:text-left lg:grid-cols-6">
          {/* Brand column */}
          <div className="flex flex-col items-center sm:col-span-2 sm:items-start lg:col-span-2">
            <Link
              href="/"
              className="mb-4 inline-flex min-h-11 items-center gap-2.5 rounded-apple-sm !text-apple-on-dark"
            >
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={28}
                height={28}
                className="h-7 w-7 max-w-full rounded-sm object-contain brightness-0 invert"
              />
              <span className="text-base font-semibold tracking-tight text-apple-on-dark">
                BornoLand
              </span>
            </Link>

            <p className="max-w-xs text-sm leading-relaxed text-apple-body-muted">
              {f.tagline}
            </p>

            <div className="mt-5 flex items-center gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "rounded-full !text-apple-body-muted hover:!bg-white/10 hover:!text-apple-on-dark",
                  )}
                >
                  <social.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className="flex flex-col items-center sm:items-start"
            >
              <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-apple-on-dark">
                {group.title}
              </h4>
              <ul className="space-y-1 sm:space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm transition-colors duration-[var(--duration-fast)] sm:min-h-0 sm:py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact strip */}
        <Card className="mt-8 rounded-apple-lg border-white/10 bg-white/5 shadow-none sm:mt-10">
          <CardContent className="p-4 text-center sm:p-5 sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-apple-body-muted">
              {f.links.contact}
            </p>
            <p className="mt-1.5 text-sm text-apple-on-dark/90">
              Dhaka, Bangladesh · support@bornoland.com
            </p>
          </CardContent>
        </Card>

        <Separator className="mt-10 bg-white/10 sm:mt-12" />

        <div className="pt-6 text-center sm:text-left">
          <p className="text-xs text-apple-body-muted">
            &copy; {COPYRIGHT_YEAR} BornoLand. {f.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
