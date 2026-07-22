"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingLocale } from "./landing-locale";
import { landingContainer, landingGridFooter } from "./landing-ui";

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
    <footer className="border-t border-apple-hairline bg-apple-canvas-parchment py-12 sm:py-16 md:py-20">
      <div className={landingContainer}>
        <div className={landingGridFooter}>
          <div className="flex flex-col items-center sm:col-span-2 sm:items-start lg:col-span-2">
            <Link
              href="/"
              className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary"
            >
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={28}
                height={28}
                className="h-7 w-7 max-w-full rounded-sm object-contain"
              />
              <span className="text-caption-strong text-apple-ink">BornoLand</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-apple-ink-muted-80">{f.tagline}</p>
          </div>

          {footerLinks.map((group) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className="flex flex-col items-center sm:items-start"
            >
              <h4 className="mb-3 text-caption-strong text-apple-ink">{group.title}</h4>
              <ul className="space-y-1 sm:space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm leading-relaxed text-apple-ink-muted-80 transition-colors hover:text-apple-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary sm:min-h-0 sm:py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-apple-hairline pt-6 text-center sm:mt-12 sm:text-left">
          <p className="text-fine-print text-apple-ink-muted-48">
            &copy; {COPYRIGHT_YEAR} BornoLand. {f.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
