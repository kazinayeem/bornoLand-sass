"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  duplicateSection,
  removeSection,
  toggleSection,
  moveSection,
  setActiveRightTab, toggleRightPanel,
} from "@/redux/slices/builder-slice";
import {
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Settings2,
  ArrowUp,
  ArrowDown,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Position tracker ──────────────────────────────────────────────────────────

function useSectionRect(sectionId: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!sectionId) { setRect(null); return; }

    const update = () => {
      const el = document.querySelector(`[data-builder-section-id="${sectionId}"]`) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };

    update();
    const ro = new ResizeObserver(update);
    const el = document.querySelector(`[data-builder-section-id="${sectionId}"]`) as HTMLElement | null;
    if (el) ro.observe(el);

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [sectionId]);

  return rect;
}

// ─── Main component ────────────────────────────────────────────────────────────

export function FloatingSectionToolbar() {
  const dispatch = useDispatch();

  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const rightPanelOpen = useSelector((s: RootState) => s.builder.rightPanelOpen);
  const selectedSection = useSelector((s: RootState) =>
    s.builder.sections.find((sec) => sec.id === selectedSectionId),
  );
  const selectedIndex = useSelector((s: RootState) =>
    s.builder.sections.findIndex((sec) => sec.id === selectedSectionId),
  );
  const totalSections = useSelector((s: RootState) => s.builder.sections.length);

  const rect = useSectionRect(selectedSectionId);

  // Don't render when nothing is selected
  if (!selectedSectionId || !selectedSection || !rect) return null;

  const canMoveUp = selectedIndex > 0;
  const canMoveDown = selectedIndex < totalSections - 1;

  // Keep controls outside the selected content whenever possible.
  const toolbarTop = rect.top - 34;
  const toolbarLeft = Math.min(window.innerWidth - 16, Math.max(16, rect.left + rect.width / 2));

  const handleMoveUp = () => {
    if (canMoveUp) dispatch(moveSection({ from: selectedIndex, to: selectedIndex - 1 }));
  };
  const handleMoveDown = () => {
    if (canMoveDown) dispatch(moveSection({ from: selectedIndex, to: selectedIndex + 1 }));
  };
  const handleDuplicate = () => dispatch(duplicateSection(selectedSectionId));
  const handleToggleVisibility = () => dispatch(toggleSection(selectedSectionId));
  const handleDelete = () => dispatch(removeSection(selectedSectionId));

  const handleOpenSettings = () => {
    dispatch(setActiveRightTab("content"));
    if (!rightPanelOpen) dispatch(toggleRightPanel());
  };

  return (
    <div
      className="pointer-events-none fixed z-[60]"
      style={{ top: 0, left: 0, width: "100vw", height: "100vh" }}
    >
      <div
        className="pointer-events-auto absolute"
        style={{
          top: Math.max(8, toolbarTop),
          left: toolbarLeft,
          transform: "translateX(-50%)",
        }}
      >
        <div className="flex items-center rounded-xl border border-zinc-200 bg-white/95 p-1 shadow-lg backdrop-blur transition-all duration-150 animate-in fade-in zoom-in-95">
          <ToolbarBtn onClick={() => document.querySelector<HTMLElement>(`[data-builder-section-id="${selectedSectionId}"] h1, [data-builder-section-id="${selectedSectionId}"] h2, [data-builder-section-id="${selectedSectionId}"] h3, [data-builder-section-id="${selectedSectionId}"] p, [data-builder-section-id="${selectedSectionId}"] span`)?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))} title="Edit text" icon={<Pencil className="h-3.5 w-3.5" />} />
          <ToolbarBtn
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            title="Move up (Alt+↑)"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
          />
          <ToolbarBtn
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            title="Move down (Alt+↓)"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
          />

          <ToolbarBtn
            onClick={handleDuplicate}
            title="Duplicate (⌘D)"
            icon={<Copy className="h-3.5 w-3.5" />}
          />

          <ToolbarBtn
            onClick={handleToggleVisibility}
            title={selectedSection.visible ? "Hide section" : "Show section"}
            active={!selectedSection.visible}
            activeColor="orange"
            icon={
              selectedSection.visible
                ? <Eye className="h-3.5 w-3.5" />
                : <EyeOff className="h-3.5 w-3.5" />
            }
          />

          <ToolbarBtn
            onClick={handleDelete}
            title="Delete (⌦)"
            danger
            icon={<Trash2 className="h-3.5 w-3.5" />}
          />

          <ToolbarBtn
            onClick={handleOpenSettings}
            title="Properties (opens right panel)"
            icon={<Settings2 className="h-3.5 w-3.5" />}
          />
        </div>

        <div className="mt-1 flex justify-center">
          <span className="rounded bg-zinc-900/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm">
            {selectedSection.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Divider() {
  return <div className="mx-0.5 h-5 w-px bg-zinc-200" />;
}

function ToolbarBtn({
  onClick,
  title,
  icon,
  disabled = false,
  danger = false,
  active = false,
  activeColor = "zinc",
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  active?: boolean;
  activeColor?: "zinc" | "red" | "orange";
}) {
  const colorMap = {
    zinc: "bg-zinc-100 text-zinc-900",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        disabled
          ? "cursor-not-allowed text-zinc-300"
          : danger
          ? "text-red-600 hover:bg-red-50 hover:text-red-700"
          : active
          ? colorMap[activeColor]
          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
      )}
    >
      {icon}
    </button>
  );
}
