"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";

export function FooterCopyright({ section }: { section: SectionData }) {
  const p = section.props;
  const text = p.text || `© ${new Date().getFullYear()} All rights reserved.`;
  const textColor = p.textColor || "#a1a1aa";
  const fontSize = p.fontSize || "12";
  const alignment = p.alignment || "center";

  return (
    <SectionWrapper section={section}>
      <div
        className={`text-${alignment}`}
        style={{
          fontFamily: p.font || "Inter",
          color: textColor,
          fontSize: `${fontSize}px`,
        }}
      >
        {text}
      </div>
    </SectionWrapper>
  );
}
