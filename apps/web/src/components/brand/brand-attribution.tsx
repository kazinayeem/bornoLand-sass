"use client";

import React from "react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/branding";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  showParentAttribution?: boolean;
  attributionVariant?: "inline" | "subtle" | "badge";
  linkHref?: string;
}

/**
 * Official BornoLand Brand Logo with optional subtle BornoSoft product attribution.
 */
export function BornoLandBrandLogo({
  className = "h-8 w-auto",
  showParentAttribution = false,
  attributionVariant = "inline",
  linkHref = "/",
}: BrandLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5 shrink-0", className)}>
      {/* Brand Icon SVG */}
      <svg className="h-8 w-8 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#1664D9" />
        <path
          d="M12 11H21C24.3137 11 27 13.6863 27 17C27 19.3484 25.4388 21.3323 23.2721 22.0298C25.7032 22.723 27.5 24.9575 27.5 27.6C27.5 30.748 24.948 33.3 21.8 33.3H12V11Z"
          fill="white"
          fillOpacity="0.18"
        />
        <path d="M13 12H20C22.2091 12 24 13.7909 24 16C24 18.2091 22.2091 20 20 20H13V12Z" fill="white" />
        <path d="M13 20H21C23.2091 20 25 21.7909 25 24C25 26.2091 23.2091 28 21 28H13V20Z" fill="white" />
        <circle cx="28" cy="11" r="3.5" fill="#34A853" />
      </svg>

      {/* Brand Name & Optional Attribution */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-xl font-bold tracking-tight text-[#181c20] dark:text-white">
            Borno<span className="text-[#1664D9]">Land</span>
          </span>
          {showParentAttribution && attributionVariant === "inline" && (
            <span className="text-[11px] font-medium text-[#727785] tracking-normal">
              {BRAND_CONFIG.parentCompany.shortAttribution}
            </span>
          )}
        </div>
        {showParentAttribution && attributionVariant === "subtle" && (
          <span className="text-[10px] font-medium text-[#727785] tracking-tight mt-0.5">
            {BRAND_CONFIG.parentCompany.attributionLabel}
          </span>
        )}
      </div>
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="inline-flex items-center focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Clickable "Made by BornoSoft.bd" footer attribution component.
 */
export function CompanyAttributionLink({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-[#424754] dark:text-zinc-400", className)}>
      <span>{BRAND_CONFIG.parentCompany.madeByText}</span>
      <a
        href={BRAND_CONFIG.parentCompany.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#181c20] hover:text-[#1664d9] dark:text-zinc-200 dark:hover:text-[#FFDA1A] transition-colors underline-offset-2 hover:underline"
      >
        {BRAND_CONFIG.parentCompany.displayName}
      </a>
    </span>
  );
}

/**
 * Subtle product ownership attribution badge or text (e.g. for hero / header / footer).
 */
export function ProductOwnershipBadge({
  className,
  variant = "pill",
}: {
  className?: string;
  variant?: "pill" | "text";
}) {
  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium text-[#727785] px-2 py-0.5 bg-[#ebeef4] dark:bg-zinc-800 rounded-md border border-[#dfe3e8]/70 dark:border-zinc-700",
          className
        )}
      >
        <span>A product of</span>
        <a
          href={BRAND_CONFIG.parentCompany.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#181c20] hover:text-[#1664d9] dark:text-zinc-200 dark:hover:text-[#FFDA1A] transition-colors"
        >
          {BRAND_CONFIG.parentCompany.name}
        </a>
      </span>
    );
  }

  return (
    <span className={cn("text-xs text-[#727785] dark:text-zinc-400 font-medium", className)}>
      A product of{" "}
      <a
        href={BRAND_CONFIG.parentCompany.url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#181c20] hover:text-[#1664d9] dark:text-zinc-200 dark:hover:text-[#FFDA1A] transition-colors underline-offset-2 hover:underline"
      >
        {BRAND_CONFIG.parentCompany.name}
      </a>
    </span>
  );
}
