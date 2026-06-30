 "use client";

import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import type { StorefrontSectionLike } from "./storefront-types";

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
  selectedSectionId?: string | null;
  hoveredSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onHoverSection?: (sectionId: string | null) => void;
};

function toSectionData(s: StorefrontSectionLike): SectionData {
  const props: Record<string, string> = {};
  if (s.props) {
    for (const [key, value] of Object.entries(s.props)) {
      props[key] = value == null ? "" : String(value);
    }
  }
  return { id: s.id, type: s.type, visible: s.visible, props };
}

export function StorefrontCanvas({ sections, selectedSectionId, hoveredSectionId, onSelectSection, onHoverSection }: StorefrontCanvasProps) {
  const visibleSections = sections.filter((section) => section.visible !== false);

  if (visibleSections.length === 0) {
    return <main />;
  }

  return (
    <main>
      {visibleSections.map((section) => (
        <div
          key={section.id}
          data-builder-section-id={section.id}
          onClick={onSelectSection ? () => onSelectSection(section.id) : undefined}
          onMouseEnter={onHoverSection ? () => onHoverSection(section.id) : undefined}
          onMouseLeave={onHoverSection ? () => onHoverSection(null) : undefined}
          className={`relative transition-all ${
            onSelectSection ? "cursor-pointer" : ""
          } ${
            selectedSectionId === section.id
              ? "ring-2 ring-blue-500/70 ring-offset-2 ring-offset-zinc-100"
              : hoveredSectionId === section.id
                ? "ring-2 ring-blue-300/60 ring-offset-2 ring-offset-zinc-100"
                : ""
          }`}
        >
          <SectionRenderer section={toSectionData(section)} />
        </div>
      ))}
    </main>
  );
}
