"use client";

import Link from "next/link";
import Image from "next/image";
import { useLandingLocale } from "./landing-locale";

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
    <footer className="border-t border-apple-hairline bg-apple-canvas-parchment px-4 py-apple-section sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={32}
                height={32}
                className="h-7 w-7 rounded-sm object-contain"
              />
              <span className="text-caption-strong text-apple-ink">BornoLand</span>
            </Link>
            <p className="max-w-xs text-fine-print leading-relaxed text-apple-ink-muted-80">{f.tagline}</p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-caption-strong text-apple-ink-muted-80">{group.title}</h4>
              <ul className="space-y-1">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-body leading-[2.41] text-apple-ink-muted-80 transition-colors hover:text-apple-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-apple-hairline pt-5 text-center">
          <p className="text-fine-print text-apple-ink-muted-48">
            &copy; {new Date().getFullYear()} BornoLand. {f.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
