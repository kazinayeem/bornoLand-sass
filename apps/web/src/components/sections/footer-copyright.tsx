"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { useFooterData } from "@/lib/storefront/use-footer-data";

export function FooterCopyright({ section }: { section: SectionData }) {
  const p = section.props;
  const { data } = useFooterData({ sectionType: "footer-copyright" });
  const textColor = p.textColor || "#a1a1aa";
  const fontSize = p.fontSize || "12";
  const alignment = p.alignment || "center";

  return (
    <SectionWrapper section={section}>
      <div
        className={alignment === "left" ? "text-left" : alignment === "right" ? "text-right" : "text-center"}
        style={{
          fontFamily: p.font || "Inter",
          color: textColor,
          fontSize: `${fontSize}px`,
        }}
      >
        {data.copyright}
      </div>
    </SectionWrapper>
  );
}
