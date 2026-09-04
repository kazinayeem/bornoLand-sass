"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BornoLandBrandLogo, CompanyAttributionLink } from "@/components/brand/brand-attribution";
import { BRAND_CONFIG } from "@/config/branding";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  children: ReactNode;
  variant?: "login" | "register" | "recovery" | "verify" | "unauthorized";
  className?: string;
};

export function AuthShell({ children, variant = "login", className }: AuthShellProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-zinc-950 text-[#181c20] dark:text-zinc-100 antialiased flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 selection:bg-[#1664d9]/10 selection:text-[#1664d9]">
      {/* Top Brand Anchor */}
      <header className="w-full max-w-[440px] mx-auto flex flex-col items-center justify-center pt-2 pb-6">
        <BornoLandBrandLogo
          className="h-8 w-auto hover:opacity-90 transition-opacity"
          linkHref="/"
          showParentAttribution={false}
        />
      </header>

      {/* Centered Authentication Card (Max width: 440px) */}
      <main className="w-full flex-1 flex items-center justify-center my-auto">
        <div className={cn("w-full max-w-[440px] mx-auto", className)}>
          <div className="bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all">
            {children}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-[440px] mx-auto pt-8 pb-2 text-center space-y-3">
        {/* Legal Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#727785] dark:text-zinc-400">
          <Link
            href="/terms"
            className="hover:text-[#181c20] dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          <span className="text-[#dfe3e8] dark:text-zinc-700">•</span>
          <Link
            href="/privacy"
            className="hover:text-[#181c20] dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline"
          >
            Privacy
          </Link>
          <span className="text-[#dfe3e8] dark:text-zinc-700">•</span>
          <Link
            href="/user-rules"
            className="hover:text-[#181c20] dark:hover:text-zinc-200 transition-colors underline-offset-4 hover:underline"
          >
            User Rules
          </Link>
        </div>

        {/* Subtle BornoSoft Product Attribution */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#727785] dark:text-zinc-500">
          <CompanyAttributionLink className="text-[11px] text-[#727785] dark:text-zinc-500" />
        </div>
      </footer>
    </div>
  );
}
