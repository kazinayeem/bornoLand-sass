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
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
          scrolled
            ? "border border-white/20 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            : "bg-white/40 backdrop-blur-sm"
        }`}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="BornoLand" width={36} height={36} priority className="h-8 w-8 rounded-lg object-contain shadow-sm" />
          <span className="text-base font-bold tracking-tight text-zinc-950">BornoLand</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            Start Free
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="mx-auto mt-2 max-w-7xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-zinc-100" />
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3.5 py-2.5 text-sm font-semibold text-zinc-700"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-md"
            >
              Start Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
