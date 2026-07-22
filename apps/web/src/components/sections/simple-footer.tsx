"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { DynamicFooter } from "@/components/storefront/dynamic-footer";

export function SimpleFooter({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <DynamicFooter
        sectionType="simple-footer"
        footerSettings={{
          template: p.layout === "split" ? "split" : "minimal",
          background: p.bgColor || undefined,
          textColor: p.textColor || undefined,
          showSocial: p.showSocial !== "false",
          showCopyright: true,
        }}
      />
    </SectionWrapper>
  );
}
