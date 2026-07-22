"use client";

import { DynamicFooter } from "./dynamic-footer";
import type { StorefrontSectionLike } from "./storefront-types";
import type { FooterLayoutSettings } from "@/lib/storefront/footer-types";

type StoreFooterProps = {
  section?: StorefrontSectionLike;
  footerSections?: StorefrontSectionLike[];
  footerSettings?: Record<string, unknown> | FooterLayoutSettings;
};

/**
 * Storefront footer — layout from theme/footerSettings, content from global store data.
 */
export function StoreFooter({ section, footerSections, footerSettings }: StoreFooterProps = {}) {
  const footerSection = section?.props
    ? section
    : footerSections?.find((s) => s.type?.includes?.("footer")) ?? null;

  const sectionStyleSettings: FooterLayoutSettings = {
    background: (footerSection?.props?.bgColor as string) || (footerSection?.props?.backgroundColor as string) || undefined,
    textColor: (footerSection?.props?.textColor as string) || undefined,
    columns: footerSection?.props?.columns ? Number(footerSection.props.columns) : undefined,
    showSocial: footerSection?.props?.showSocial !== "false",
    showNewsletter: footerSection?.props?.showNewsletter === "true",
    showPaymentIcons: footerSection?.props?.showPaymentIcons !== "false",
    showCopyright: footerSection?.props?.showCopyright !== "false",
    padding: footerSection?.style?.paddingTop ? `${footerSection.style.paddingTop} 0` : undefined,
  };

  return (
    <DynamicFooter
      footerSettings={{ ...sectionStyleSettings, ...footerSettings }}
      sectionType={footerSection?.type}
    />
  );
}
