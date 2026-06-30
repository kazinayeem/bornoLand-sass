 "use client";

import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import type { StorefrontSectionLike } from "./storefront-types";

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
  selectedSectionId?: string | null;
  hoveredSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onHoverSection?: (sectionId: string | null) => void;
  onQuickEditRequest?: (payload: { sectionId: string; mode: "text" | "image" | "button" }) => void;
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

export function StorefrontCanvas({ sections, selectedSectionId, hoveredSectionId, onSelectSection, onHoverSection, onQuickEditRequest }: StorefrontCanvasProps) {
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
          onClick={(event) => {
            onSelectSection?.(section.id);
            if (!onQuickEditRequest) return;
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const tagName = target.tagName.toLowerCase();
            if (tagName === "img") {
              onQuickEditRequest({ sectionId: section.id, mode: "image" });
            } else if (tagName === "a" || tagName === "button") {
              onQuickEditRequest({ sectionId: section.id, mode: "button" });
            }
          }}
          onDoubleClick={(event) => {
            if (!onQuickEditRequest) return;
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const tagName = target.tagName.toLowerCase();
            if (["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "small"].includes(tagName)) {
              onQuickEditRequest({ sectionId: section.id, mode: "text" });
            }
          }}
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
