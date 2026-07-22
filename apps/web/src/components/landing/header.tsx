"use client";

import { useState, useEffect, useCallback, useId } from "react";
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
  const menuId = useId();

  const navLinks = [
    { label: t.nav.features, href: "#features", id: "features" },
    { label: t.nav.builder, href: "#builder", id: "builder" },
    { label: t.nav.management, href: "#management", id: "management" },
    { label: t.nav.pricing, href: "#pricing", id: "pricing" },
    { label: t.nav.faq, href: "#faq", id: "faq" },
  ];

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, closeMenu]);

  const switchLocale = (next: LandingLocale) => {
    setLocale(next);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top bar — logo / nav / actions */}
      <nav
        aria-label="Primary"
        className="flex h-12 items-center justify-center bg-apple-surface-black px-0 sm:h-11"
      >
        <div className={cn(landingContainer, "flex items-center justify-between gap-3")}>
          <Link
            href="/"
            className="flex min-h-11 min-w-11 items-center gap-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            onClick={closeMenu}
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

          {/* Desktop / laptop nav — center */}
          <div className="hidden items-center gap-0.5 lg:flex">
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

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex xl:gap-3">
            <LanguageToggle locale={locale} onChange={switchLocale} />
            <Link
              href="/login"
              className="btn-press inline-flex h-9 min-h-9 items-center rounded-sm bg-apple-ink px-4 text-caption text-apple-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              {t.nav.login}
            </Link>
            <Link href="/register" className={cn(landingBtnPrimary, "h-9 min-h-9 w-auto min-w-0 px-5 text-caption")}>
              {t.nav.startFree}
            </Link>
          </div>

          {/* Tablet actions — compact CTA + menu */}
          <div className="hidden items-center gap-1.5 md:flex lg:hidden">
            <LanguageToggle locale={locale} onChange={switchLocale} compact />
            <Link
              href="/register"
              className={cn(landingBtnPrimary, "h-9 min-h-9 w-auto min-w-0 px-4 text-caption")}
            >
              {t.nav.getStarted}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-apple-body-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls={menuId}
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-apple-body-on-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>
      </nav>

      {/* Secondary frosted strip */}
      <div
        className={`frosted-bar border-b border-apple-hairline/60 transition-shadow duration-300 ${
          scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.04)]" : ""
        }`}
      >
        <div className={cn(landingContainer, "flex h-12 items-center justify-between sm:h-[52px]")}>
          <span className="truncate text-tagline text-apple-ink">{t.nav.platform}</span>
          <Link
            href="/register"
            className={`${landingBtnPrimary} hidden h-9 min-h-9 w-auto min-w-0 px-5 text-caption lg:inline-flex`}
          >
            {t.nav.getStarted}
          </Link>
        </div>
      </div>

      {/* Full-screen mobile / tablet drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-apple-surface-black/45 backdrop-blur-[2px] lg:hidden"
              onClick={closeMenu}
            />
            <motion.div
              id={menuId}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: easeApple }}
              className="fixed inset-y-0 right-0 z-[70] flex w-full flex-col bg-apple-canvas shadow-2xl md:max-w-md lg:hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-apple-hairline px-4">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo.png"
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                  <span className="text-sm font-semibold text-apple-ink">BornoLand</span>
                </div>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
                <nav aria-label="Mobile sections" className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={activeSection === link.id ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center rounded-xl px-4 text-base font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary",
                        activeSection === link.id
                          ? "bg-blue-50 font-semibold text-apple-primary"
                          : "text-apple-ink-muted-80 hover:bg-apple-canvas-parchment hover:text-apple-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 border-t border-apple-divider-soft pt-5">
                  <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-apple-ink-muted-48">
                    Language
                  </p>
                  <LanguageToggle
                    locale={locale}
                    onChange={(next) => {
                      switchLocale(next);
                    }}
                    drawer
                  />
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-apple-divider-soft pt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="btn-press inline-flex h-12 min-h-12 w-full items-center justify-center rounded-pill border border-apple-hairline bg-apple-canvas text-body font-semibold text-apple-ink transition-colors hover:bg-apple-canvas-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-primary"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className={cn(landingBtnPrimary, "w-full")}
                  >
                    {t.nav.getStarted}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function LanguageToggle({
  locale,
  onChange,
  compact = false,
  drawer = false,
}: {
  locale: LandingLocale;
  onChange: (locale: LandingLocale) => void;
  compact?: boolean;
  drawer?: boolean;
}) {
  if (drawer) {
    return (
      <div
        className="inline-flex w-full items-center rounded-xl border border-apple-hairline bg-apple-canvas-parchment p-1"
        role="group"
        aria-label="Language"
      >
        {([
          { id: "en" as const, label: "English" },
          { id: "bn" as const, label: "বাংলা" },
        ]).map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={locale === opt.id}
            className={cn(
              "inline-flex h-11 min-h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-apple-primary",
              locale === opt.id
                ? "bg-apple-canvas text-apple-ink shadow-sm"
                : "text-apple-ink-muted-80 hover:text-apple-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center rounded-full border border-white/15 bg-white/5 p-0.5"
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
          className={cn(
            "rounded-full text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/80",
            compact ? "min-h-8 px-2.5 py-1.5" : "min-h-8 px-2.5 py-1",
            locale === opt.id
              ? "bg-white text-apple-ink"
              : "text-apple-body-on-dark/70 hover:text-apple-body-on-dark",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
