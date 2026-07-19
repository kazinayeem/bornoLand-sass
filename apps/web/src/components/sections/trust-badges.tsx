"use client";

import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function TrustBadges({ section }: { section: SectionData }) {
  const p = section.props;
  const items = (section.style?.trustBadgeItems ?? []) as { id: string; title: string; description: string; icon: string }[];
  const visible = items;
  if (visible.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="px-4 sm:px-6 lg:px-8 py-12 text-center">
          <SectionTitle title={p.title || "Why Shop With Us"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
          <p className="mt-4 text-sm text-zinc-400">No trust badges yet. Add them in the Content tab.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionTitle title={p.title || "Why Shop With Us"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 text-xl">
                {badge.icon || "🔒"}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-zinc-900">{badge.title || "Badge"}</h3>
              <p className="mt-1 text-xs text-zinc-400">{badge.description || ""}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
