"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingLocale } from "./landing-locale";
import { landingContainer } from "./landing-ui";
import { LandingButton } from "./landing-button";
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
    { label: t.nav.features || (locale === "bn" ? "ফিচার" : "Features"), href: "features" },
    { label: locale === "bn" ? "কীভাবে কাজ করে" : "How it works", href: "how-it-works" },
    { label: t.nav.builder || (locale === "bn" ? "দোকান ডিজাইন" : "Store Builder"), href: "store-builder" },
    { label: t.nav.pricing || (locale === "bn" ? "মূল্য" : "Pricing"), href: "pricing" },
    { label: t.nav.faq || (locale === "bn" ? "প্রশ্ন উত্তর" : "FAQ"), href: "faq" },
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
            ? "border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl shadow-xs py-3.5"
            : "bg-transparent py-5"
        )}
      >
        <div
          className={cn(
            landingContainer,
            "flex items-center justify-between gap-4"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={22}
                height={22}
                priority
                className="h-5 w-5 object-contain brightness-0 invert"
              />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-950">
              BornoLand
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1.5 shadow-2xs backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-950 hover:bg-zinc-100/70"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Action CTAs & Locale */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
              className="text-xs font-semibold text-zinc-700 hover:text-blue-600 transition-colors px-2.5 py-1 rounded-md border border-zinc-200 bg-zinc-50"
              aria-label={locale === "bn" ? "Switch to English" : "বাংলা ভাষা বেছে নিন"}
            >
              {locale === "bn" ? "English" : "বাংলা"}
            </button>

            {isAuthenticated ? (
              <LandingButton
                variant="primary"
                size="sm"
                href="/dashboard"
              >
                {locale === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </LandingButton>
            ) : (
              <>
                <LandingButton
                  variant="ghost"
                  size="sm"
                  href="/login"
                >
                  {t.nav.login || (locale === "bn" ? "লগইন" : "Log In")}
                </LandingButton>
                <LandingButton
                  variant="primary"
                  size="sm"
                  href="/register"
                >
                  {t.nav.startFree || (locale === "bn" ? "ফ্রি শুরু করুন" : "Start Free")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </LandingButton>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/80 text-zinc-700 backdrop-blur-md transition-colors hover:bg-zinc-100"
              aria-label={locale === "bn" ? "মেনু খুলুন" : "Open mobile menu"}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-Over Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-6 bg-white flex flex-col justify-between">
          <div>
            <SheetHeader className="text-left border-b border-zinc-100 pb-4">
              <SheetTitle className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="BornoLand"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
                <span className="text-base font-bold text-zinc-900">BornoLand</span>
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-1 py-6">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <a
                    href={`#${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </a>
                </SheetClose>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-zinc-500 font-medium">{locale === "bn" ? "ভাষা" : "Language"}</span>
              <button
                type="button"
                onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
                className="text-xs font-semibold text-zinc-900 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200"
              >
                {locale === "bn" ? "English" : "বাংলা"}
              </button>
            </div>
            {isAuthenticated ? (
              <LandingButton
                variant="primary"
                size="default"
                href="/dashboard"
                className="w-full"
                onClick={closeMenu}
              >
                {locale === "bn" ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </LandingButton>
            ) : (
              <>
                <LandingButton
                  variant="secondary"
                  size="default"
                  href="/login"
                  className="w-full"
                  onClick={closeMenu}
                >
                  {t.nav.login || (locale === "bn" ? "লগইন" : "Log In")}
                </LandingButton>
                <LandingButton
                  variant="primary"
                  size="default"
                  href="/register"
                  className="w-full"
                  onClick={closeMenu}
                >
                  {t.nav.startFree || (locale === "bn" ? "ফ্রি শুরু করুন" : "Start Free")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </LandingButton>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
