"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  duplicateSection,
  copySection,
  pasteSection,
  removeSection,
  toggleSection,
  toggleSectionLock,
  moveSection,
  setActiveTab,
} from "@/redux/slices/builder-slice";
import { useCreateTemplateFromPageMutation } from "@/redux/api/builder-template-api";
import { useRequiredStore } from "@/providers/store-context";
import { toast } from "sonner";
import {
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Settings2,
  ArrowUp,
  ArrowDown,
  ClipboardPaste,
  BookmarkPlus,
  GripVertical,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Position tracker ──────────────────────────────────────────────────────────

function useSectionRect(sectionId: string | null) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!sectionId) { setRect(null); return; }

    const update = () => {
      const el = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
      setRect(el ? el.getBoundingClientRect() : null);
    };

    update();
    const ro = new ResizeObserver(update);
    const el = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
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
  const { storeId } = useRequiredStore();
  const [createTemplateFromPage, { isLoading: savingTemplate }] = useCreateTemplateFromPageMutation();

  const selectedSectionId = useSelector((s: RootState) => s.builder.selectedSectionId);
  const selectedSection = useSelector((s: RootState) =>
    s.builder.sections.find((sec) => sec.id === selectedSectionId),
  );
  const selectedIndex = useSelector((s: RootState) =>
    s.builder.sections.findIndex((sec) => sec.id === selectedSectionId),
  );
  const totalSections = useSelector((s: RootState) => s.builder.sections.length);
  const clipboardSection = useSelector((s: RootState) => s.builder.clipboardSection);
  const pageId = useSelector((s: RootState) => s.builder.page.id);

  const rect = useSectionRect(selectedSectionId);

  // Don't render when nothing is selected
  if (!selectedSectionId || !selectedSection || !rect) return null;

  const canMoveUp = selectedIndex > 0;
  const canMoveDown = selectedIndex < totalSections - 1;

  // Toolbar sits 4px above the section top edge
  const toolbarTop = rect.top - 44;
  const toolbarLeft = rect.left + rect.width / 2;

  const handleMoveUp = () => {
    if (canMoveUp) dispatch(moveSection({ from: selectedIndex, to: selectedIndex - 1 }));
  };
  const handleMoveDown = () => {
    if (canMoveDown) dispatch(moveSection({ from: selectedIndex, to: selectedIndex + 1 }));
  };
  const handleDuplicate = () => dispatch(duplicateSection(selectedSectionId));
  const handleCopy = () => dispatch(copySection(selectedSectionId));
  const handlePaste = () => dispatch(pasteSection(selectedSectionId));
  const handleToggleVisibility = () => dispatch(toggleSection(selectedSectionId));
  const handleToggleLock = () => dispatch(toggleSectionLock(selectedSectionId));
  const handleDelete = () => dispatch(removeSection(selectedSectionId));

  const handleSaveAsTemplate = async () => {
    if (!pageId) { toast.error("Save the page first before creating a template."); return; }
    try {
      await createTemplateFromPage({
        storeId,
        pageId,
        name: `${selectedSection.label} — Template`,
        description: `Saved from section: ${selectedSection.label}`,
        category: "custom",
      }).unwrap();
      toast.success(`"${selectedSection.label}" saved as a template`);
    } catch {
      toast.error("Failed to save template");
    }
  };

  const handleOpenSettings = () => {
    // Ensure right panel is visible and on the content tab
    dispatch(setActiveTab("layers")); // bring focus back, right panel opens automatically on selection
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
        {/* Toolbar pill */}
        <div className="flex items-center rounded-2xl border border-zinc-200/80 bg-white/95 px-1.5 py-1.5 shadow-xl backdrop-blur-md ring-1 ring-black/5">

          {/* Drag indicator */}
          <div className="flex items-center border-r border-zinc-200 pr-1.5 mr-0.5">
            <div className="flex h-7 w-6 cursor-grab items-center justify-center text-zinc-300 active:cursor-grabbing">
              <GripVertical className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Move up/down */}
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

          <Divider />

          {/* Duplicate */}
          <ToolbarBtn
            onClick={handleDuplicate}
            title="Duplicate (⌘D)"
            icon={<Copy className="h-3.5 w-3.5" />}
          />

          {/* Copy */}
          <ToolbarBtn
            onClick={handleCopy}
            title="Copy (⌘C)"
            icon={<Copy className="h-3.5 w-3.5" strokeWidth={2.5} />}
          />

          {/* Paste */}
          <ToolbarBtn
            onClick={handlePaste}
            disabled={!clipboardSection}
            title="Paste after (⌘V)"
            icon={<ClipboardPaste className="h-3.5 w-3.5" />}
          />

          <Divider />

          {/* Save as template */}
          <ToolbarBtn
            onClick={handleSaveAsTemplate}
            disabled={savingTemplate}
            title="Save as template"
            icon={
              savingTemplate
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <BookmarkPlus className="h-3.5 w-3.5" />
            }
          />

          <Divider />

          {/* Visibility */}
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

          {/* Lock */}
          <ToolbarBtn
            onClick={handleToggleLock}
            title={selectedSection.locked ? "Unlock section" : "Lock section"}
            active={!!selectedSection.locked}
            activeColor="red"
            icon={
              selectedSection.locked
                ? <Lock className="h-3.5 w-3.5" />
                : <LockOpen className="h-3.5 w-3.5" />
            }
          />

          <Divider />

          {/* Delete */}
          <ToolbarBtn
            onClick={handleDelete}
            title="Delete (⌦)"
            danger
            icon={<Trash2 className="h-3.5 w-3.5" />}
          />

          <Divider />

          {/* Settings — opens properties panel */}
          <ToolbarBtn
            onClick={handleOpenSettings}
            title="Properties (opens right panel)"
            icon={<Settings2 className="h-3.5 w-3.5" />}
          />
        </div>

        {/* Label tag */}
        <div className="mt-1.5 flex justify-center">
          <span className="rounded-lg border border-zinc-200/80 bg-white/95 px-2 py-0.5 text-[10px] font-medium text-zinc-500 shadow-sm backdrop-blur-sm">
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
