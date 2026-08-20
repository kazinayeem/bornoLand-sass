"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingLocale, type LandingLocale } from "./landing-locale";
import { landingContainer } from "./landing-ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Builder", href: "#builder" },
  { label: "Local Commerce", href: "#bangladesh" },
  { label: "Developers", href: "#developers" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const { locale, setLocale } = useLandingLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setMobileOpen(false), []);

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
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="BornoLand"
                width={22}
                height={22}
                priority
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-950">
              BornoLand
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1.5 shadow-2xs backdrop-blur-md">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-950 hover:bg-zinc-100/70"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action CTAs & Locale */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1 rounded-md"
            >
              {locale === "bn" ? "English" : "বাংলা"}
            </button>
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 hover:shadow-sm"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white/80 text-zinc-700 backdrop-blur-md transition-colors hover:bg-zinc-100"
              aria-label="Open mobile menu"
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
              {NAV_LINKS.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs text-zinc-500 font-medium">Language</span>
              <button
                type="button"
                onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
                className="text-xs font-semibold text-zinc-900 px-2 py-1 rounded-md bg-zinc-100"
              >
                {locale === "bn" ? "English" : "বাংলা"}
              </button>
            </div>
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={closeMenu}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-950 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
