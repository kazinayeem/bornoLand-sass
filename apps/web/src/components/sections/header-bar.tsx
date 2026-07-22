"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { NavbarRenderer } from "@/components/storefront/navbar-renderer";

/** Builder header section — uses the same NavbarRenderer as the live storefront. */
export function HeaderBar({ section }: { section: SectionData }) {
  return (
    <SectionWrapper section={section} className="w-full" allowSticky bare>
      <NavbarRenderer sectionProps={section.props} />
    </SectionWrapper>
  );
}
