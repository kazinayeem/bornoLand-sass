"use client";

import Link from "next/link";
import Image from "next/image";
import { landingContainer } from "./landing-ui";

export function Footer() {
  const FOOTER_COLS = [
    {
      title: "প্ল্যাটফর্ম",
      links: [
        { label: "ফিচারসমূহ", href: "#features" },
        { label: "স্টোর বিল্ডার", href: "#builder" },
        { label: "পণ্য ক্যাটালগ", href: "#features" },
        { label: "পেমেন্ট ও কুরিয়ার", href: "#payments" },
        { label: "মূল্য তালিকা", href: "#pricing" },
      ],
    },
    {
      title: "সলিউশন",
      links: [
        { label: "অনলাইন শপ", href: "/register" },
        { label: "বুটিক ও ফ্যাশন", href: "/register" },
        { label: "ফেসবুক ও ইনস্টাগ্রাম সেলার", href: "/register" },
        { label: "রিটেইল ব্যবসা", href: "/register" },
      ],
    },
    {
      title: "ডেভেলপার",
      links: [
        { label: "REST API", href: "#developers" },
        { label: "Webhooks", href: "#developers" },
        { label: "ডকুমেন্টেশন", href: "#developers" },
      ],
    },
    {
      title: "কোম্পানি",
      links: [
        { label: "আমাদের সম্পর্কে", href: "/about" },
        { label: "যোগাযোগ", href: "/contact" },
        { label: "সাপোর্ট সেন্টার", href: "/contact" },
      ],
    },
    {
      title: "আইনি",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Refund Policy", href: "/refund-policy" },
      ],
    },
  ];

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
              আপনার অনলাইন ব্যবসা শুরু করা, চালানো এবং বড় করা — সবকিছু এক জায়গায়।
            </p>
          </div>

          {/* Nav Columns */}
          {FOOTER_COLS.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-950">
                {col.title}
              </p>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
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
          <p>© {new Date().getFullYear()} BornoLand Technologies. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="font-medium text-zinc-600">বাংলাদেশের আধুনিক ই-কমার্সের জন্য তৈরি।</p>
        </div>
      </div>
    </footer>
  );
}
