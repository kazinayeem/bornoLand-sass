"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Builder", href: "#builder" },
  { label: "Pricing", href: "#pricing" },
  { label: "Demo", href: "#platform" },
  { label: "Docs", href: "/docs" },
  { label: "Contact", href: "#contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Global nav — Apple black bar */}
      <nav className="flex h-11 items-center justify-center bg-apple-surface-black px-4 sm:px-6">
        <div className="flex w-full max-w-[1440px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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

          <div className="hidden items-center gap-5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-nav-link text-apple-body-on-dark/80 transition-colors hover:text-apple-body-on-dark"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="btn-press rounded-sm bg-apple-ink px-[15px] py-2 text-caption text-apple-on-dark"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="btn-press rounded-pill bg-apple-primary px-[22px] py-[11px] text-body text-apple-on-primary"
            >
              Start Free
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="rounded-sm p-2 text-apple-body-on-dark md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Sub-nav frosted bar */}
      <div
        className={`frosted-bar border-b border-apple-hairline/50 transition-all duration-300 ${
          scrolled ? "shadow-none" : ""
        }`}
      >
        <div className="mx-auto flex h-[52px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-tagline text-apple-ink dark:text-apple-body-on-dark">Platform</span>
          <Link
            href="/register"
            className="btn-press hidden rounded-pill bg-apple-primary px-[22px] py-[11px] text-body text-apple-on-primary sm:inline-flex"
          >
            Get Started
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="border-b border-apple-hairline bg-apple-canvas px-4 py-4 dark:border-apple-surface-tile-3 dark:bg-apple-surface-tile-2 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-sm px-3.5 py-2.5 text-caption text-apple-ink-muted-80 transition-colors hover:bg-apple-canvas-parchment hover:text-apple-ink"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-apple-divider-soft" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-sm px-3.5 py-2.5 text-caption-strong text-apple-ink"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="btn-press mt-1 rounded-pill bg-apple-primary px-3.5 py-2.5 text-center text-body text-apple-on-primary"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
