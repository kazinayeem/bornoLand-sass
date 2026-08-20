 "use client";

import { memo, useEffect, useMemo, useState } from "react";
import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import { BuilderProvider } from "@/components/sections/builder-link";
import type { StorefrontSectionLike } from "./storefront-types";
import { Copy, EyeOff, Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { getSectionDef } from "@/lib/section-registry";
import { cn } from "@/lib/utils";
import { sectionsEqualForRender } from "@/lib/section-style";
import type { BuilderSection } from "@/redux/slices/builder-slice";

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
  selectedSectionId?: string | null;
  hoveredSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  onHoverSection?: (sectionId: string | null) => void;
  onQuickEditRequest?: (payload: {
    sectionId: string;
    mode: "text" | "image" | "button" | "video";
    anchor: {
      x: number;
      y: number;
      width: number;
      height: number;
      top: number;
      left: number;
      right: number;
      bottom: number;
    };
  }) => void;
  /** Fired when a section is clicked but no editable element was targeted */
  onQuickEditDismiss?: () => void;
  onQuickInsert?: (index: number, event: React.MouseEvent) => void;
  /** Updates made by the canvas are immediately reflected in the draft (and autosaved by the editor). */
  onInlineTextChange?: (payload: { sectionId: string; key: string; value: string }) => void;
  onSectionAction?: (payload: { sectionId: string; action: "duplicate" | "delete" | "hide" | "lock" | "copy" }) => void;
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

// The canvas wrapper must update for selection, hover and insertion affordances,
// but a section's rendered storefront should update only when that section's
// record changes. Builder reducers preserve untouched section references, so
// this comparator cuts full-canvas rendering work on single-section edits.
const CanvasSectionRenderer = memo(function CanvasSectionRenderer({ section }: { section: StorefrontSectionLike }) {
  return <SectionRenderer section={toSectionData(section)} />;
}, (previous, next) => sectionsEqualForRender(previous.section as BuilderSection, next.section as BuilderSection));

type HoverCard = { sectionId: string; label: string; rect: DOMRect };

const EDITABLE_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "small", "li", "figcaption", "label"]);
const TEXT_KEYS = ["headline", "title", "kicker", "subheadline", "subtitle", "description", "text", "content", "buttonText", "badge", "copyright", "placeholderText"];

function rectPayload(el: Element) {
  const r = el.getBoundingClientRect();
  return {
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
  };
}

function resolveQuickEditTarget(target: HTMLElement): {
  mode: "text" | "image" | "button" | "video";
  el: HTMLElement;
} | null {
  const img = target.closest("img");
  if (img instanceof HTMLElement) return { mode: "image", el: img };

  const video = target.closest("video, iframe");
  if (video instanceof HTMLElement) return { mode: "video", el: video };

  const mediaBg = target.closest("[data-quick-edit='image'], [data-bg-image], .bg-cover, .bg-center");
  if (mediaBg instanceof HTMLElement && (mediaBg.style.backgroundImage || mediaBg.getAttribute("data-bg-image"))) {
    return { mode: "image", el: mediaBg };
  }

  const btn = target.closest("a, button, [role='button']");
  if (btn instanceof HTMLElement) return { mode: "button", el: btn };

  const svg = target.closest("svg");
  if (svg instanceof SVGElement) {
    const host = (svg.parentElement instanceof HTMLElement ? svg.parentElement : svg) as HTMLElement;
    return { mode: "image", el: host };
  }

  const tagName = target.tagName.toLowerCase();
  if (EDITABLE_TAGS.has(tagName)) return { mode: "text", el: target };

  return null;
}

function findEditableProp(section: StorefrontSectionLike, target: HTMLElement) {
  const text = target.innerText?.trim();
  if (!text || text.length > 800) return null;
  const entries = Object.entries(section.props ?? {});
  const exact = entries.find(([, value]) => String(value).trim() === text);
  if (exact) return exact[0];
  const normalized = text.replace(/\s+/g, " ").trim();
  const partial = entries.find(([key, value]) => TEXT_KEYS.includes(key) && String(value).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() === normalized);
  return partial?.[0] ?? null;
}

export function StorefrontCanvas({ sections, selectedSectionId, hoveredSectionId, onSelectSection, onHoverSection, onQuickEditRequest, onQuickEditDismiss, onQuickInsert, onInlineTextChange, onSectionAction }: StorefrontCanvasProps) {
  const visibleSections = useMemo(() => {
    const seen = new Set<string>();
    return sections.filter((section) => {
      if (section.visible === false || !section.id) return false;
      if (seen.has(section.id)) return false;
      seen.add(section.id);
      return true;
    });
  }, [sections]);

  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);
  const [clickedInsertIndex, setClickedInsertIndex] = useState<number | null>(null);
  const [hoverCard, setHoverCard] = useState<HoverCard | null>(null);
  const [contextMenu, setContextMenu] = useState<{ sectionId: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => { window.removeEventListener("click", close); window.removeEventListener("scroll", close, true); };
  }, []);

  const selectedLabel = useMemo(() => {
    const section = sections.find((item) => item.id === selectedSectionId);
    return section ? (getSectionDef(section.type)?.label ?? section.type) : null;
  }, [sections, selectedSectionId]);

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
            isHovered || isClicked ? "bg-gradient-to-r from-transparent via-apple-primary/60 to-apple-primary/60" : "bg-transparent"
          )} />
          
          {/* Button */}
          <button
            type="button"
            className={cn(
              "mx-3 flex items-center gap-2 rounded-full border shadow-lg transition-all duration-200 whitespace-nowrap",
              isHovered || isClicked
                ? "scale-100 border-apple-primary bg-apple-primary px-4 py-2 text-apple-on-primary shadow-lg hover:opacity-90"
                : "scale-95 border-apple-hairline bg-apple-canvas px-3 py-1.5 text-apple-ink-muted-80"
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
              Add block
            </span>
          </button>
          
          {/* Right line */}
          <div className={cn(
            "flex-1 h-px transition-all duration-200",
            isHovered || isClicked ? "bg-gradient-to-l from-transparent via-apple-primary/60 to-apple-primary/60" : "bg-transparent"
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
              if ((event.target as HTMLElement)?.dataset.builderInline === "true") return;
              onSelectSection?.(section.id);
              if (!onQuickEditRequest) return;
              const target = event.target as HTMLElement | null;
              if (!target) {
                onQuickEditDismiss?.();
                return;
              }
              const resolved = resolveQuickEditTarget(target);
              if (resolved) {
                document.querySelectorAll("[data-quick-edit-anchor='true']").forEach((el) => {
                  el.removeAttribute("data-quick-edit-anchor");
                });
                resolved.el.setAttribute("data-quick-edit-anchor", "true");
                onQuickEditRequest({
                  sectionId: section.id,
                  mode: resolved.mode,
                  anchor: rectPayload(resolved.el),
                });
              } else {
                onQuickEditDismiss?.();
              }
            }}
            onDoubleClick={(event) => {
              const target = event.target as HTMLElement | null;
              if (!target) return;
              const tagName = target.tagName.toLowerCase();
              const key = EDITABLE_TAGS.has(tagName) ? findEditableProp(section, target) : null;
              if (key && onInlineTextChange) {
                event.preventDefault();
                event.stopPropagation();
                target.dataset.builderInline = "true";
                target.dataset.builderProp = key;
                target.dataset.builderOriginal = target.innerText;
                target.contentEditable = "true";
                target.spellcheck = true;
                target.focus();
                const range = document.createRange();
                range.selectNodeContents(target);
                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(range);
              } else if (onQuickEditRequest && EDITABLE_TAGS.has(tagName)) {
                document.querySelectorAll("[data-quick-edit-anchor='true']").forEach((el) => {
                  el.removeAttribute("data-quick-edit-anchor");
                });
                target.setAttribute("data-quick-edit-anchor", "true");
                onQuickEditRequest({
                  sectionId: section.id,
                  mode: "text",
                  anchor: rectPayload(target),
                });
              }
            }}
            onKeyDown={(event) => {
              const target = event.target as HTMLElement;
              if (target.dataset.builderInline !== "true") return;
              if (event.key === "Enter") { event.preventDefault(); target.blur(); }
              if (event.key === "Escape") { event.preventDefault(); target.innerText = target.dataset.builderOriginal ?? ""; target.blur(); }
            }}
            onBlur={(event) => {
              const target = event.target as HTMLElement;
              const key = target.dataset.builderProp;
              if (target.dataset.builderInline !== "true" || !key) return;
              target.contentEditable = "false";
              target.spellcheck = false;
              delete target.dataset.builderInline;
              delete target.dataset.builderProp;
              delete target.dataset.builderOriginal;
              onInlineTextChange?.({ sectionId: section.id, key, value: target.innerText.trim() });
            }}
            onContextMenu={(event) => {
              if (!onSectionAction) return;
              event.preventDefault();
              onSelectSection?.(section.id);
              setContextMenu({ sectionId: section.id, x: event.clientX, y: event.clientY });
            }}
            onMouseEnter={(event) => {
              onHoverSection?.(section.id);
              setHoverCard({ sectionId: section.id, label: getSectionDef(section.type)?.label ?? section.type, rect: event.currentTarget.getBoundingClientRect() });
            }}
            onMouseLeave={() => { onHoverSection?.(null); setHoverCard(null); }}
            className={cn(
              "relative transition-all duration-200 ease-apple",
              onSelectSection ? "cursor-pointer" : "",
              selectedSectionId === section.id
                ? "ring-2 ring-apple-primary ring-offset-2 ring-offset-apple-canvas-parchment shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                : hoveredSectionId === section.id
                  ? "ring-2 ring-apple-primary/35 ring-offset-2 ring-offset-apple-canvas-parchment"
                  : ""
            )}
          >
            <CanvasSectionRenderer section={section} />
          </div>
          {onQuickInsert && <InsertionBar index={i + 1} />}
        </div>
      ))}
    </main>
  );

  if (isBuilderMode) {
    return <BuilderProvider>
      {canvasContent}
      {hoverCard && hoverCard.sectionId !== selectedSectionId && (
        <div className="pointer-events-none fixed z-[70] rounded-apple-md bg-apple-ink/90 px-2.5 py-1 text-fine-print font-medium text-white shadow-lg backdrop-blur-sm" style={{ top: Math.max(6, hoverCard.rect.top + 6), left: Math.max(6, hoverCard.rect.left + 6) }}>
          {hoverCard.label} · {Math.round(hoverCard.rect.width)} × {Math.round(hoverCard.rect.height)}
        </div>
      )}
      {contextMenu && (
        <div className="fixed z-[80] w-44 rounded-apple-lg border border-apple-hairline bg-apple-canvas p-1.5 shadow-2xl" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(event) => event.stopPropagation()}>
          <p className="px-2 py-1 text-fine-print font-medium text-apple-ink-muted-48">{selectedLabel ?? "Block"}</p>
          <CanvasMenuItem icon={<Pencil />} label="Edit" onClick={() => {
            const el = document.querySelector(`[data-builder-section-id="${contextMenu.sectionId}"]`);
            onQuickEditRequest?.({
              sectionId: contextMenu.sectionId,
              mode: "text",
              anchor: el ? rectPayload(el) : {
                x: contextMenu.x, y: contextMenu.y, width: 1, height: 1,
                top: contextMenu.y, left: contextMenu.x, right: contextMenu.x + 1, bottom: contextMenu.y + 1,
              },
            });
            setContextMenu(null);
          }} />
          <CanvasMenuItem icon={<Copy />} label="Duplicate" onClick={() => { onSectionAction?.({ sectionId: contextMenu.sectionId, action: "duplicate" }); setContextMenu(null); }} />
          <CanvasMenuItem icon={<Copy />} label="Copy" onClick={() => { onSectionAction?.({ sectionId: contextMenu.sectionId, action: "copy" }); setContextMenu(null); }} />
          <CanvasMenuItem icon={<EyeOff />} label="Hide" onClick={() => { onSectionAction?.({ sectionId: contextMenu.sectionId, action: "hide" }); setContextMenu(null); }} />
          <CanvasMenuItem icon={<Lock />} label="Lock" onClick={() => { onSectionAction?.({ sectionId: contextMenu.sectionId, action: "lock" }); setContextMenu(null); }} />
          <div className="my-1 border-t border-zinc-100" />
          <CanvasMenuItem icon={<Trash2 />} label="Delete" destructive onClick={() => { onSectionAction?.({ sectionId: contextMenu.sectionId, action: "delete" }); setContextMenu(null); }} />
        </div>
      )}
    </BuilderProvider>;
  }
  return canvasContent;
}

function CanvasMenuItem({ icon, label, onClick, destructive = false }: { icon: React.ReactNode; label: string; onClick: () => void; destructive?: boolean }) {
  return <button type="button" onClick={onClick} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium hover:bg-apple-canvas-parchment", destructive ? "text-red-600 hover:bg-red-50" : "text-apple-ink-muted-80")}><span className="h-3.5 w-3.5">{icon}</span>{label}</button>;
}
