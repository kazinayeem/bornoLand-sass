"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function RichText({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8" style={{ columnCount: p.columns === "2" ? 2 : 1, columnGap: "2rem" }}>
        {p.showTitle !== "false" && p.title && <SectionTitle title={p.title} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />}
        <div className="prose prose-zinc max-w-none text-sm leading-relaxed" style={{ color: p.textColor || "#52525b" }}>
          {p.content?.split("\n").map((line, i) => <p key={i}>{line || <br />}</p>)}
        </div>
      </div>
    </SectionWrapper>
  );
}
