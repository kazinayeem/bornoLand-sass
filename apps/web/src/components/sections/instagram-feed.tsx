"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function InstagramFeed({ section }: { section: SectionData }) {
  const p = section.props;
  const count = Number(p.postCount) || 6;
  const cols = p.columns || "3";
  const colMap: Record<string, string> = { "2": "grid-cols-2", "3": "grid-cols-3", "4": "grid-cols-4", "6": "grid-cols-3 sm:grid-cols-6" };

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Follow Us on Instagram"} subtitle={p.handle || "@yourstore"} textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className={`grid ${colMap[cols] || "grid-cols-3"} gap-3`}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 relative group cursor-pointer">
              <div className="flex h-full items-center justify-center text-2xl">📷</div>
              {p.showLikes === "true" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-semibold text-white">❤️ {Math.floor(Math.random() * 200 + 10)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
