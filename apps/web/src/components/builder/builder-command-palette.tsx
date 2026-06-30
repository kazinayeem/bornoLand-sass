"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { addSection, setActiveTab } from "@/redux/slices/builder-slice";
import { getDefaultProps, sectionRegistry } from "@/lib/section-registry";

type BuilderCommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function BuilderCommandPalette({ open, onClose }: BuilderCommandPaletteProps) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const actions = useMemo(() => {
    const baseActions = [
      { id: "layers", label: "Open Layers", hint: "Navigate builder structure", run: () => dispatch(setActiveTab("layers")) },
      { id: "pages", label: "Open Pages", hint: "Manage builder pages", run: () => dispatch(setActiveTab("pages")) },
      { id: "components", label: "Open Components", hint: "Browse insertable sections", run: () => dispatch(setActiveTab("components")) },
      { id: "templates", label: "Open Templates", hint: "Browse template gallery", run: () => dispatch(setActiveTab("templates")) },
      { id: "media", label: "Open Media", hint: "Browse builder assets", run: () => dispatch(setActiveTab("media")) },
    ];

    const sectionActions = sectionRegistry.slice(0, 32).map((section) => ({
      id: `section-${section.type}`,
      label: `Insert ${section.label}`,
      hint: section.description,
      run: () => {
        dispatch(
          addSection({
            id: `${section.type}-${Date.now()}`,
            type: section.type,
            label: section.label,
            visible: true,
            props: getDefaultProps(section.type),
          }),
        );
      },
    }));

    return [...baseActions, ...sectionActions];
  }, [dispatch]);

  const filteredActions = actions.filter((action) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return action.label.toLowerCase().includes(normalized) || action.hint.toLowerCase().includes(normalized);
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Command Palette"
      description="Jump to a panel, search components, or insert sections."
      size="xl"
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands, sections, templates, media..."
            className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-11 pr-4 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400 focus:bg-white"
          />
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.run();
                onClose();
              }}
              className="flex w-full items-start justify-between rounded-2xl border border-transparent bg-zinc-50 px-4 py-3 text-left transition-all hover:border-zinc-200 hover:bg-white"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900">{action.label}</p>
                <p className="mt-1 text-xs text-zinc-500">{action.hint}</p>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-400 shadow-sm">Enter</span>
            </button>
          ))}
          {filteredActions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-10 text-center">
              <p className="text-sm font-medium text-zinc-700">No matches found</p>
              <p className="mt-1 text-xs text-zinc-500">Try searching for pages, media, templates, or section names.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
