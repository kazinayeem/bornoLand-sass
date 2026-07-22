"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { DynamicFooter } from "@/components/storefront/dynamic-footer";

export function EcommerceFooter({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <DynamicFooter
        sectionType="ecommerce-footer"
        footerSettings={{
          template: "commerce",
          columns: Number(p.columns) || 4,
          background: p.bgColor || undefined,
          textColor: p.textColor || undefined,
          showSocial: p.showSocial !== "false",
          showNewsletter: p.showNewsletter !== "false",
          showPaymentIcons: p.showPaymentIcons !== "false",
          showCopyright: true,
          showContact: true,
        }}
      />
    </SectionWrapper>
  );
}
