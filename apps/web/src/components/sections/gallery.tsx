"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function Gallery({ section }: { section: SectionData }) {
  const p = section.props;
  const cols = p.columns || "3";
  const colMap: Record<string, string> = { "2": "grid-cols-2", "3": "grid-cols-3", "4": "grid-cols-4" };
  const items = (section.style?.galleryItems ?? []) as { id: string; image: string; title: string; alt: string; link: string }[];

  if (items.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="px-4 sm:px-6 lg:px-8 py-12 text-center">
          <SectionTitle title={p.title || "Gallery"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
          <p className="mt-4 text-sm text-apple-ink-muted-48">No gallery images yet. Add them in the Content tab.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Gallery"} subtitle={p.subtitle || ""} textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className={`grid ${colMap[cols] || "grid-cols-3"} gap-4`}>
          {items.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
              {img.image ? (
                <img src={img.image} alt={img.alt || img.title || ""} className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-300 text-sm">{img.title || "Gallery Image"}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
