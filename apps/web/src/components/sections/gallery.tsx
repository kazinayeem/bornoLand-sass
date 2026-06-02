"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function Gallery({ section }: { section: SectionData }) {
  const p = section.props;
  const cols = p.columns || "3";
  const count = Number(p.imageCount) || 6;
  const colMap: Record<string, string> = { "2": "grid-cols-2", "3": "grid-cols-3", "4": "grid-cols-4" };

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Gallery"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className={`grid ${colMap[cols] || "grid-cols-3"} gap-4`}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
              <div className="flex h-full items-center justify-center text-zinc-300 text-sm">Image {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
