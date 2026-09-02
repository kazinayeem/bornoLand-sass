"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ArrowRight, Globe, Layers, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "./landing-locale";
import { landingContainer } from "./landing-ui";
import { scrollToSection } from "@/lib/scroll-utils";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export function Header() {
  const { locale, setLocale, t } = useLandingLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle hash scrolling on initial mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.slice(1);
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, []);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  const navLinks = [
    { label: t.nav.platform, href: "platform-architecture" },
    { label: t.nav.builder, href: "builder" },
    { label: t.nav.pos, href: "pos" },
    { label: t.nav.inventory, href: "inventory" },
    { label: t.nav.accounting, href: "accounting" },
    { label: t.nav.hrm, href: "hrm" },
    { label: t.nav.analytics, href: "analytics" },
    { label: t.nav.pricing, href: "pricing" },
    { label: t.nav.faq, href: "faq" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
    closeMenu();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
      <nav
        aria-label="Primary Navigation"
        className={cn(
          "transition-all duration-300",
          scrolled
            ? "border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-xs py-3"
            : "bg-transparent py-4 sm:py-5"
        )}
      >
        <div className={cn(landingContainer, "flex items-center justify-between gap-3")}>
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] group shrink-0"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#003399] shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={20}
                height={20}
                priority
                className="h-4.5 w-4.5 object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#111111]">
                BornoLand
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden xl:flex items-center gap-0.5 rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1 shadow-2xs backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:text-[#003399] hover:bg-zinc-100/70"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher Pill */}
            <div className="flex items-center rounded-full border border-zinc-200/80 bg-white/90 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setLocale("en")}
                aria-label="Switch to English"
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                  locale === "en"
                    ? "bg-[#003399] text-white shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-950"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale("bn")}
                aria-label="Switch to Bangla"
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                  locale === "bn"
                    ? "bg-[#003399] text-white shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-950"
                )}
              >
                বাং
              </button>
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003399] text-xs font-bold text-white shadow-xs hover:bg-[#002B80] transition-colors"
              >
                <span>{t.nav.dashboard}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 px-3.5 sm:px-4 py-2 rounded-lg bg-[#003399] text-xs font-bold text-white shadow-xs hover:bg-[#002B80] transition-all hover:shadow-sm"
                >
                  <span>{t.nav.startFree}</span>
                  <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="xl:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-2xs hover:bg-zinc-50"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <SheetHeader className="text-left border-b border-zinc-100 pb-4">
              <SheetTitle className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#003399] text-white">
                  <Image
                    src="/logo.png"
                    alt="BornoLand"
                    width={18}
                    height={18}
                    className="brightness-0 invert"
                  />
                </div>
                <span className="font-extrabold text-base text-zinc-950">BornoLand</span>
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={`#${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 pt-6 border-t border-zinc-100">
            {/* Language Selection */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <span className="text-xs font-semibold text-zinc-600">{t.nav.language}:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-bold transition-all",
                    locale === "en" ? "bg-[#003399] text-white" : "text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("bn")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-bold transition-all",
                    locale === "bn" ? "bg-[#003399] text-white" : "text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003399] text-white text-sm font-bold shadow-xs hover:bg-[#002B80]"
              >
                <span>{t.nav.dashboard}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-bold hover:bg-zinc-50"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80]"
                >
                  {t.nav.startFree}
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
