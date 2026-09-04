"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Store,
  QrCode,
  Boxes,
  Users,
  Wallet,
  LineChart,
  BookOpen,
  HelpCircle,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { landingContainer } from "./landing-ui";
import { useGetProfileQuery } from "@/redux/api/profile-api";
import { BornoLandBrandLogo } from "@/components/brand/brand-attribution";
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
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);

  const { data: profileData } = useGetProfileQuery();
  const isAuthenticated = Boolean(profileData?.data?.profile);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
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
            ? "border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl shadow-xs py-3"
            : "bg-white/80 backdrop-blur-md border-b border-zinc-200/50 py-3.5"
        )}
      >
        <div className={cn(landingContainer, "flex items-center justify-between gap-4")}>
          {/* Logo */}
          <BornoLandBrandLogo showParentAttribution attributionVariant="inline" />

          {/* Desktop Nav Items with Dropdowns */}
          <div className="hidden lg:flex items-center gap-1 rounded-full border border-zinc-200/80 bg-white/90 px-4 py-1.5 shadow-2xs backdrop-blur-md">
            <Link
              href="/"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70",
                pathname === "/" ? "text-[#003399] font-bold" : "text-zinc-600"
              )}
            >
              Home
            </Link>

            {/* Features Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFeaturesDropdownOpen(true)}
              onMouseLeave={() => setFeaturesDropdownOpen(false)}
            >
              <Link
                href="/features"
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70 flex items-center gap-1",
                  pathname === "/features" ? "text-[#003399] font-bold" : "text-zinc-600"
                )}
              >
                <span>Features</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </Link>

              {featuresDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200 p-3 grid grid-cols-1 gap-1 z-50">
                  <Link
                    href="/features#commerce"
                    onClick={() => setFeaturesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <Store className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Commerce &amp; Storefront</div>
                      <div className="text-[11px] text-zinc-500">Digital D2C stores with bKash/Nagad</div>
                    </div>
                  </Link>

                  <Link
                    href="/features#pos"
                    onClick={() => setFeaturesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Cloud POS Register</div>
                      <div className="text-[11px] text-zinc-500">Fast barcode scanning &amp; offline mode</div>
                    </div>
                  </Link>

                  <Link
                    href="/features#inventory"
                    onClick={() => setFeaturesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <Boxes className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Multi-Warehouse Inventory</div>
                      <div className="text-[11px] text-zinc-500">Stock transfers &amp; low stock alerts</div>
                    </div>
                  </Link>

                  <Link
                    href="/features#hrm-payroll"
                    onClick={() => setFeaturesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <Users className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">HRM &amp; Payroll</div>
                      <div className="text-[11px] text-zinc-500">Biometric timeclocks &amp; auto salary</div>
                    </div>
                  </Link>

                  <Link
                    href="/features#finance"
                    onClick={() => setFeaturesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Double-Entry Accounting</div>
                      <div className="text-[11px] text-zinc-500">Audited ledgers &amp; P&amp;L reports</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/solutions"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70",
                pathname === "/solutions" ? "text-[#003399] font-bold" : "text-zinc-600"
              )}
            >
              Solutions
            </Link>

            <Link
              href="/how-it-works"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70",
                pathname === "/how-it-works" ? "text-[#003399] font-bold" : "text-zinc-600"
              )}
            >
              How It Works
            </Link>

            <Link
              href="/pricing"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70",
                pathname === "/pricing" ? "text-[#003399] font-bold" : "text-zinc-600"
              )}
            >
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesDropdownOpen(true)}
              onMouseLeave={() => setResourcesDropdownOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70 flex items-center gap-1 cursor-pointer",
                  pathname.startsWith("/docs") || pathname === "/faq" || pathname === "/how-to-use" || pathname === "/help"
                    ? "text-[#003399] font-bold"
                    : "text-zinc-600"
                )}
              >
                <span>Resources</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {resourcesDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 p-3 grid grid-cols-1 gap-1 z-50">
                  <Link
                    href="/docs"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Documentation</div>
                      <div className="text-[11px] text-zinc-500">Comprehensive developer &amp; store docs</div>
                    </div>
                  </Link>

                  <Link
                    href="/how-to-use"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Beginner Onboarding Guide</div>
                      <div className="text-[11px] text-zinc-500">16-step complete tutorial</div>
                    </div>
                  </Link>

                  <Link
                    href="/help"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Help Center</div>
                      <div className="text-[11px] text-zinc-500">Knowledge base &amp; troubleshooting</div>
                    </div>
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Frequently Asked Questions</div>
                      <div className="text-[11px] text-zinc-500">Categorized question answers</div>
                    </div>
                  </Link>

                  <Link
                    href="/user-rules"
                    onClick={() => setResourcesDropdownOpen(false)}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">User Rules &amp; Policies</div>
                      <div className="text-[11px] text-zinc-500">Acceptable platform conduct</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors hover:text-[#003399] hover:bg-zinc-100/70",
                pathname === "/contact" ? "text-[#003399] font-bold" : "text-zinc-600"
              )}
            >
              Contact
            </Link>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onOpenDemo && (
              <button
                type="button"
                onClick={onOpenDemo}
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80 transition-colors cursor-pointer"
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
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#003399] text-xs font-bold text-white shadow-xs hover:bg-[#002B80] transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex lg:hidden items-center justify-center p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-[320px] sm:w-[380px] p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <SheetHeader className="text-left border-b border-zinc-100 pb-4">
              <SheetTitle asChild>
                <div>
                  <BornoLandBrandLogo />
                </div>
              </SheetTitle>
            </SheetHeader>

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-1">
              <Link
                href="/"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/features"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Features
              </Link>
              <Link
                href="/solutions"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Solutions
              </Link>
              <Link
                href="/how-it-works"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/how-to-use"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-emerald-700 hover:bg-emerald-50/50 transition-colors flex items-center justify-between"
              >
                <span>How to Use (Beginner Guide)</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link
                href="/docs"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Documentation
              </Link>
              <Link
                href="/help"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Help Center
              </Link>
              <Link
                href="/pricing"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-[#003399] hover:bg-blue-50/50 transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 space-y-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#003399] text-sm font-bold text-white shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-800 hover:bg-zinc-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#003399] text-sm font-bold text-white shadow-xs"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
