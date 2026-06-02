import Link from "next/link";
import { Store } from "lucide-react";

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
    <footer className="border-t border-zinc-200/60 bg-zinc-50/50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <Store className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-zinc-900">
                Borno<span className="text-blue-600">Land</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500 max-w-xs">
              The complete ecommerce platform for building, managing, and growing your online store.
            </p>
            <div className="mt-4 flex gap-2.5">
              {["X", "in", "f", "yt"].map((s) => (
                <span
                  key={s}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-[10px] font-bold text-zinc-400 transition-colors hover:border-zinc-300 hover:text-zinc-600"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-700">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-zinc-500 transition-colors hover:text-zinc-800"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-zinc-200/60 pt-5 text-center">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} BornoLand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
