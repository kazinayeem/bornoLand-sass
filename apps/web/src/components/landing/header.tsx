"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { landingContainer } from "./landing-ui";
import { scrollToSection } from "@/lib/scroll-utils";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface HeaderProps {
  onOpenDemo?: () => void;
}

export function Header({ onOpenDemo }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
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
    { label: "Product", href: "platform" },
    { label: "Solutions", href: "solutions" },
    { label: "Features", href: "features" },
    { label: "Pricing", href: "pricing" },
    { label: "FAQ", href: "faq" },
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
            ? "border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl shadow-xs py-3"
            : "bg-transparent py-4 sm:py-5"
        )}
      >
        <div className={cn(landingContainer, "flex items-center justify-between gap-4")}>
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
          <div className="hidden md:flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white/80 px-4 py-1.5 shadow-2xs backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="rounded-full px-3.5 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:text-[#003399] hover:bg-zinc-100/70 cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenDemo && (
              <button
                type="button"
                onClick={onOpenDemo}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 transition-colors cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Book Demo</span>
              </button>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003399] text-xs font-bold text-white shadow-xs hover:bg-[#002B80] transition-colors"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#003399] text-xs font-bold text-white shadow-xs hover:bg-[#002B80] transition-all hover:shadow-sm active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-2xs hover:bg-zinc-50 cursor-pointer"
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
                  className="px-3.5 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              {onOpenDemo && (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    onOpenDemo();
                  }}
                  className="px-3.5 py-2.5 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors text-left flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Book a Product Demo</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-3 pt-6 border-t border-zinc-100">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003399] text-white text-sm font-bold shadow-xs hover:bg-[#002B80]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-xs font-bold hover:bg-zinc-50"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center py-2.5 rounded-xl bg-[#003399] text-white text-xs font-bold shadow-xs hover:bg-[#002B80]"
                >
                  Start Free
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
