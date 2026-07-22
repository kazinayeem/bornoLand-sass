"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingLocale } from "./landing-locale";
import { landingContainer } from "./landing-ui";

const COPYRIGHT_YEAR = 2026;

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
      title: f.resources,
      links: [
        { label: f.links.blog, href: "/blog" },
        { label: f.links.docs, href: "/docs" },
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
      title: f.legal,
      links: [
        { label: f.links.terms, href: "/terms" },
        { label: f.links.privacy, href: "/privacy" },
        { label: f.links.refund, href: "/refund" },
      ],
    },
  ];

  return (
    <footer className="border-t border-apple-hairline bg-apple-canvas-parchment py-16 sm:py-20">
      <div className={landingContainer}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary"
            >
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={28}
                height={28}
                className="h-7 w-7 rounded-sm object-contain"
              />
              <span className="text-caption-strong text-apple-ink">BornoLand</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-apple-ink-muted-80">{f.tagline}</p>
          </div>

          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h4 className="mb-3 text-caption-strong text-apple-ink">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block text-sm leading-relaxed text-apple-ink-muted-80 transition-colors hover:text-apple-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-apple-hairline pt-6 text-center sm:text-left">
          <p className="text-fine-print text-apple-ink-muted-48">
            &copy; {COPYRIGHT_YEAR} BornoLand. {f.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
