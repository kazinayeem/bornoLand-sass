"use client";

import Link from "next/link";
import Image from "next/image";
import { landingContainer } from "./landing-ui";
import { scrollToSection } from "@/lib/scroll-utils";
import { useLandingLocale } from "./landing-locale";
import { CheckCircle2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const { locale, setLocale, t } = useLandingLocale();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToSection(href.slice(1));
    }
  };

  const columns = [
    t.footer.columns.product,
    t.footer.columns.solutions,
    t.footer.columns.resources,
    t.footer.columns.company,
    t.footer.columns.legal,
  ];

  return (
    <footer className="border-t border-zinc-200/80 bg-zinc-50/80 pt-16 pb-12 text-zinc-600">
      <div className={landingContainer}>
        {/* Top Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-zinc-200/80">
          {/* Brand Info Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003399] text-white shadow-xs">
                <Image
                  src="/logo.png"
                  alt="BornoLand"
                  width={20}
                  height={20}
                  className="h-4.5 w-4.5 object-contain brightness-0 invert"
                />
              </div>
              <span className="text-base font-extrabold tracking-tight text-zinc-950">
                BornoLand
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>

            {/* Platform Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-[#0A8A00]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A8A00] animate-pulse" />
              <span>{t.footer.status}</span>
            </div>
          </div>

          {/* 5 Navigation Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-950">
                {col.title}
              </p>
              <ul className="space-y-2 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link.href)}
                      className="text-zinc-500 hover:text-[#003399] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Language Switcher */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} BornoLand. {t.footer.rights}</p>

          <div className="flex items-center gap-3">
            {/* Footer Language Selector */}
            <div className="flex items-center gap-1 text-xs">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={cn(
                  "font-bold transition-colors cursor-pointer",
                  locale === "en" ? "text-[#003399]" : "text-zinc-500 hover:text-zinc-800"
                )}
              >
                English
              </button>
              <span className="text-zinc-300">|</span>
              <button
                type="button"
                onClick={() => setLocale("bn")}
                className={cn(
                  "font-bold transition-colors cursor-pointer",
                  locale === "bn" ? "text-[#003399]" : "text-zinc-500 hover:text-zinc-800"
                )}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
