"use client";

import Link from "next/link";
import Image from "next/image";
import { landingContainer } from "./landing-ui";
import { scrollToSection } from "@/lib/scroll-utils";
import { useLandingLocale } from "./landing-locale";

export function Footer() {
  const { locale, t } = useLandingLocale();

  const footerCols = [
    {
      title: t.footer.product || (locale === "bn" ? "প্ল্যাটফর্ম" : "Platform"),
      links: [
        { label: locale === "bn" ? "ফিচারসমূহ" : "Features", href: "#features" },
        { label: locale === "bn" ? "স্টোর বিল্ডার" : "Store Builder", href: "#store-builder" },
        { label: locale === "bn" ? "পণ্য ক্যাটালগ" : "Products", href: "#products" },
        { label: locale === "bn" ? "পেমেন্ট ও কুরিয়ার" : "Payments & Courier", href: "#payments" },
        { label: locale === "bn" ? "মূল্য তালিকা" : "Pricing", href: "#pricing" },
      ],
    },
    {
      title: locale === "bn" ? "সলিউশন" : "Solutions",
      links: [
        { label: locale === "bn" ? "অনলাইন শপ" : "Online Shop", href: "/register" },
        { label: locale === "bn" ? "বুটিক ও ফ্যাশন" : "Boutique & Fashion", href: "/register" },
        { label: locale === "bn" ? "ফেসবুক ও ইনস্টাগ্রাম সেলার" : "Social Sellers", href: "/register" },
        { label: locale === "bn" ? "রিটেইল ব্যবসা" : "Retail Business", href: "/register" },
      ],
    },
    {
      title: locale === "bn" ? "ডেভেলপার" : "Developer",
      links: [
        { label: "REST API", href: "#developer" },
        { label: "Webhooks", href: "#developer" },
        { label: t.footer.links?.docs || (locale === "bn" ? "ডকুমেন্টেশন" : "Documentation"), href: "/docs" },
      ],
    },
    {
      title: t.footer.company || (locale === "bn" ? "কোম্পানি" : "Company"),
      links: [
        { label: t.footer.links?.about || (locale === "bn" ? "আমাদের সম্পর্কে" : "About Us"), href: "/about" },
        { label: t.footer.links?.contact || (locale === "bn" ? "যোগাযোগ" : "Contact"), href: "/contact" },
        { label: t.footer.links?.support || (locale === "bn" ? "সাপোর্ট সেন্টার" : "Support Center"), href: "/support" },
      ],
    },
    {
      title: t.footer.legal || (locale === "bn" ? "আইনি" : "Legal"),
      links: [
        { label: t.footer.links?.privacy || "Privacy Policy", href: "/privacy" },
        { label: t.footer.links?.terms || "Terms of Service", href: "/terms" },
        { label: t.footer.links?.refund || "Refund Policy", href: "/refund" },
      ],
    },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToSection(href);
    }
  };

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/70 pt-16 pb-12 text-zinc-600">
      <div className={landingContainer}>
        {/* Top Grid + Brand Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-zinc-200/80">
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-xs">
                <Image
                  src="/logo.png"
                  alt="BornoLand"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-zinc-950">
                BornoLand
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              {t.footer?.tagline || (locale === "bn"
                ? "আপনার অনলাইন ব্যবসা শুরু করা, চালানো এবং বড় করা — সবকিছু এক জায়গায়।"
                : "Build, manage, and grow your online store from one place.")}
            </p>
          </div>

          {/* Nav Columns */}
          {footerCols.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-950">
                {col.title}
              </p>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} BornoLand Technologies. {t.footer?.rights || (locale === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved.")}</p>
          <p className="font-medium text-zinc-600">
            {locale === "bn" ? "বাংলাদেশের আধুনিক ই-কমার্সের জন্য তৈরি।" : "Made for modern ecommerce in Bangladesh."}
          </p>
        </div>
      </div>
    </footer>
  );
}
