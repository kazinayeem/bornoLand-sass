"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLandingLocale, type LandingLocale } from "./landing-locale";
import {
  landingBtnPrimary,
  landingContainer,
  navLinkClass,
  useActiveSection,
  easeApple,
} from "./landing-ui";

const SECTION_IDS = ["features", "builder", "management", "pricing", "faq"];

export function Header() {
  const { t, locale, setLocale } = useLandingLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);

  const navLinks = [
    { label: t.nav.features, href: "#features", id: "features" },
    { label: t.nav.builder, href: "#builder", id: "builder" },
    { label: t.nav.management, href: "#management", id: "management" },
    { label: t.nav.pricing, href: "#pricing", id: "pricing" },
    { label: t.nav.faq, href: "#faq", id: "faq" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const switchLocale = (next: LandingLocale) => {
    setLocale(next);
    setMobileOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className="flex h-11 items-center justify-center bg-apple-surface-black px-4 sm:px-6"
      >
        <div className={cn(landingContainer, "flex items-center justify-between")}>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
          >
            <Image
              src="/logo.png"
              alt="BornoLand"
              width={20}
              height={20}
              priority
              className="h-5 w-5 object-contain"
            />
            <span className="text-nav-link text-apple-body-on-dark">BornoLand</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activeSection === link.id ? "page" : undefined}
                className={navLinkClass(activeSection === link.id, true)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle locale={locale} onChange={switchLocale} />
            <Link
              href="/login"
              className="btn-press inline-flex h-9 items-center rounded-sm bg-apple-ink px-4 text-caption text-apple-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              {t.nav.login}
            </Link>
            <Link href="/register" className={cn(landingBtnPrimary, "h-9 min-w-0 px-5 text-caption")}>
              {t.nav.startFree}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle locale={locale} onChange={switchLocale} compact />
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm text-apple-body-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`frosted-bar border-b border-apple-hairline/60 transition-shadow duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.04)]" : ""
        }`}
      >
        <div className={cn(landingContainer, "flex h-[52px] items-center justify-between")}>
          <span className="text-tagline text-apple-ink">{t.nav.platform}</span>
          <Link
            href="/register"
            className={`${landingBtnPrimary} hidden h-9 min-w-0 px-5 text-caption sm:inline-flex`}
          >
            {t.nav.getStarted}
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: easeApple }}
            className="absolute inset-x-0 top-[calc(2.75rem+52px)] max-h-[calc(100dvh-6rem)] overflow-y-auto border-b border-apple-hairline bg-apple-canvas/95 backdrop-blur-md md:hidden"
          >
            <div className="px-4 py-4">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={activeSection === link.id ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3.5 py-3 text-caption transition-colors",
                      activeSection === link.id
                        ? "bg-blue-50 font-semibold text-apple-primary"
                        : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <hr className="my-3 border-apple-divider-soft" />
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3.5 py-3 text-center text-caption-strong text-apple-ink"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(landingBtnPrimary, "w-full")}
                >
                  {t.nav.startFree}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LanguageToggle({
  locale,
  onChange,
  compact = false,
}: {
  locale: LandingLocale;
  onChange: (locale: LandingLocale) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/15 bg-white/5 p-0.5 ${
        compact ? "" : ""
      }`}
      role="group"
      aria-label="Language"
    >
      {([
        { id: "en" as const, label: "EN" },
        { id: "bn" as const, label: "বাং" },
      ]).map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-pressed={locale === opt.id}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/80 ${
            locale === opt.id
              ? "bg-white text-apple-ink"
              : "text-apple-body-on-dark/70 hover:text-apple-body-on-dark"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
