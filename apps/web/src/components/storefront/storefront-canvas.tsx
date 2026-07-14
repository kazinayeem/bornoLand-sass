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
  onQuickInsert?: (index: number) => void;
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

export function StorefrontCanvas({ sections, selectedSectionId, hoveredSectionId, onSelectSection, onHoverSection, onQuickEditRequest, onQuickInsert }: StorefrontCanvasProps) {
  const visibleSections = sections.filter((section) => section.visible !== false);

  if (visibleSections.length === 0) {
    return <main />;
  }

  const InsertButton = ({ index }: { index: number }) => (
    <div className="group relative h-1.5 transition-all hover:h-8">
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onQuickInsert?.(index)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-white shadow-md hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );

  return (
    <main>
      {onQuickInsert && <InsertButton index={0} />}
      {visibleSections.map((section, i) => (
        <div key={section.id}>
          <div
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
          {onQuickInsert && <InsertButton index={i + 1} />}
        </div>
      ))}
    </main>
  );
}
