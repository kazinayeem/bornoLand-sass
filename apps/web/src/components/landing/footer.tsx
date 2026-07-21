import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Builder", href: "#builder" },
      { label: "Pricing", href: "#pricing" },
      { label: "Integrations", href: "#integrations" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/support" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-apple-hairline bg-apple-canvas-parchment px-4 py-apple-section sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px]">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="mb-3 flex items-center gap-2">
              <Image src="/logo.png" alt="BornoLand" width={32} height={32} className="h-7 w-7 rounded-sm object-contain" />
              <span className="text-caption-strong text-apple-ink">BornoLand</span>
            </Link>
            <p className="max-w-xs text-fine-print leading-relaxed text-apple-ink-muted-80">
              The complete ecommerce platform for building, managing, and growing your online store.
            </p>
            <div className="mt-4 flex gap-2.5">
              {["X", "in", "f", "yt"].map((s) => (
                <span
                  key={s}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-apple-hairline text-[10px] font-bold text-apple-ink-muted-48 transition-colors hover:border-apple-hairline hover:text-apple-ink-muted-80"
                >
                  {s}
                </span>
              ))}
            </div>
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
            &copy; {new Date().getFullYear()} BornoLand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
