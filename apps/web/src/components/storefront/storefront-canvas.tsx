 "use client";

import { useState } from "react";
import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import { BuilderProvider } from "@/components/sections/builder-link";
import type { StorefrontSectionLike } from "./storefront-types";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
  selectedSectionId?: string | null;
  hoveredSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onHoverSection?: (sectionId: string | null) => void;
  onQuickEditRequest?: (payload: { sectionId: string; mode: "text" | "image" | "button" }) => void;
  onQuickInsert?: (index: number, event: React.MouseEvent) => void;
};

function toSectionData(s: StorefrontSectionLike): SectionData {
  const props: Record<string, string> = {};
  if (s.props) {
    for (const [key, value] of Object.entries(s.props)) {
      props[key] = value == null ? "" : String(value);
    }
  }
  return { id: s.id, type: s.type, visible: s.visible, props, style: s.style };
}

export function StorefrontCanvas({ sections, selectedSectionId, hoveredSectionId, onSelectSection, onHoverSection, onQuickEditRequest, onQuickInsert }: StorefrontCanvasProps) {
  const visibleSections = sections.filter((section) => section.visible !== false);
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);
  const [clickedInsertIndex, setClickedInsertIndex] = useState<number | null>(null);

  if (visibleSections.length === 0) {
    return <main />;
  }

  const InsertionBar = ({ index }: { index: number }) => {
    const isHovered = hoveredInsertIndex === index;
    const isClicked = clickedInsertIndex === index;
    
    return (
      <div 
        className={cn(
          "group relative transition-all duration-200",
          isHovered || isClicked ? "h-12 my-2" : "h-1"
        )}
        onMouseEnter={() => setHoveredInsertIndex(index)}
        onMouseLeave={() => setHoveredInsertIndex(null)}
        onClick={(e) => {
          if (isClicked) {
            // If already clicked, clicking again closes it
            setClickedInsertIndex(null);
          } else {
            setClickedInsertIndex(index);
            onQuickInsert?.(index, e);
          }
        }}
      >
        {/* Hover/Click area expander */}
        <div className="absolute inset-0 -my-4" />
        
        {/* The actual insertion bar */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200",
          isHovered || isClicked ? "opacity-100" : "opacity-0"
        )}>
          {/* Left line */}
          <div className={cn(
            "flex-1 h-px transition-all duration-200",
            isHovered || isClicked ? "bg-gradient-to-r from-transparent via-blue-400 to-blue-400" : "bg-transparent"
          )} />
          
          {/* Button */}
          <button
            type="button"
            className={cn(
              "mx-3 flex items-center gap-2 rounded-full border shadow-lg transition-all duration-200 whitespace-nowrap",
              isHovered || isClicked
                ? "bg-blue-500 border-blue-600 text-white px-4 py-2 hover:bg-blue-600 hover:shadow-xl scale-100"
                : "bg-white border-zinc-300 text-zinc-600 px-3 py-1.5 scale-95"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setClickedInsertIndex(index);
              onQuickInsert?.(index, e);
            }}
          >
            <Plus className={cn(
              "transition-all duration-200",
              isHovered || isClicked ? "h-4 w-4" : "h-3.5 w-3.5"
            )} />
            <span className={cn(
              "font-medium text-sm transition-all duration-200",
              isHovered || isClicked ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 overflow-hidden"
            )}>
              Add Section
            </span>
          </button>
          
          {/* Right line */}
          <div className={cn(
            "flex-1 h-px transition-all duration-200",
            isHovered || isClicked ? "bg-gradient-to-l from-transparent via-blue-400 to-blue-400" : "bg-transparent"
          )} />
        </div>
      </div>
    );
  };

  const isBuilderMode = !!onSelectSection;
  const canvasContent = (
    <main>
      {onQuickInsert && <InsertionBar index={0} />}
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
          {onQuickInsert && <InsertionBar index={i + 1} />}
        </div>
      ))}
    </main>
  );

  if (isBuilderMode) {
    return <BuilderProvider>{canvasContent}</BuilderProvider>;
  }
  return canvasContent;
}
