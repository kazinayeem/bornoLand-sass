"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingLocale, type LandingLocale } from "./landing-locale";
import {
  landingContainer,
  navLinkClass,
  useActiveSection,
} from "./landing-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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

  const closeMenu = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = (next: LandingLocale) => {
    setLocale(next);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Primary"
        className={cn(
          "border-b border-border bg-background/90 backdrop-blur-md transition-shadow duration-[var(--duration-normal)]",
          scrolled && "shadow-sm",
        )}
      >
        <div
          className={cn(
            landingContainer,
            "relative flex h-14 items-center justify-between gap-3 sm:h-16",
          )}
        >
          {/* Logo — left */}
          <Link
            href="/"
            className="relative z-10 flex min-h-11 items-center gap-2 rounded-apple-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={closeMenu}
          >
            <Image
              src="/logo.png"
              alt="BornoLand"
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />
            <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
              BornoLand
            </span>
          </Link>

          {/* Nav links — centered (desktop) */}
          <div className="absolute inset-x-0 hidden items-center justify-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={activeSection === link.id ? "page" : undefined}
                className={navLinkClass(activeSection === link.id)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions — right (desktop) */}
          <div className="relative z-10 hidden items-center gap-2 lg:flex">
            <LanguageToggle locale={locale} onChange={switchLocale} />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-pill text-muted-foreground hover:text-foreground",
              )}
            >
              {t.nav.login}
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-pill px-5 font-semibold shadow-sm",
              )}
            >
              {t.nav.startFree}
            </Link>
          </div>

          {/* Tablet / mobile actions */}
          <div className="relative z-10 flex items-center gap-2 lg:hidden">
            <div className="hidden sm:block">
              <LanguageToggle locale={locale} onChange={switchLocale} compact />
            </div>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "hidden rounded-pill px-4 font-semibold sm:inline-flex",
              )}
            >
              {t.nav.getStarted}
            </Link>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen(true)}
                className="rounded-full text-foreground"
              >
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
              <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
                <SheetHeader className="border-b border-border px-5 py-4 text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                    BornoLand
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    {t.nav.platform}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4">
                  <nav aria-label="Mobile sections" className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={activeSection === link.id ? "page" : undefined}
                          className={cn(
                            "flex min-h-11 items-center rounded-apple-lg px-4 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            activeSection === link.id
                              ? "bg-primary/10 font-semibold text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  <Separator className="my-5" />

                  <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Language
                  </p>
                  <LanguageToggle
                    locale={locale}
                    onChange={switchLocale}
                    drawer
                  />

                  <div className="mt-auto flex flex-col gap-3 border-t border-border pt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "w-full rounded-pill font-semibold",
                        )}
                      >
                        {t.nav.login}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/register"
                        className={cn(
                          buttonVariants({ variant: "default" }),
                          "w-full rounded-pill font-semibold",
                        )}
                      >
                        {t.nav.getStarted}
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
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
        className="inline-flex w-full items-center rounded-apple-lg border border-border bg-muted p-1"
        role="group"
        aria-label="Language"
      >
        {(
          [
            { id: "en" as const, label: "English" },
            { id: "bn" as const, label: "বাংলা" },
          ] as const
        ).map((opt) => (
          <Button
            key={opt.id}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(opt.id)}
            aria-pressed={locale === opt.id}
            className={cn(
              "h-11 min-h-11 flex-1 rounded-apple-md text-sm font-semibold",
              locale === opt.id
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center rounded-pill border border-border bg-muted/60 p-0.5"
      role="group"
      aria-label="Language"
    >
      {(
        [
          { id: "en" as const, label: "EN" },
          { id: "bn" as const, label: "বাং" },
        ] as const
      ).map((opt) => (
        <Button
          key={opt.id}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(opt.id)}
          aria-pressed={locale === opt.id}
          className={cn(
            "rounded-pill text-[11px] font-semibold",
            compact ? "min-h-8 px-2.5 py-1.5" : "min-h-8 px-2.5 py-1",
            locale === opt.id
              ? "bg-card text-foreground shadow-sm hover:bg-card"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
