"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { Search, X } from "lucide-react";
import { addSection, setActiveTab } from "@/redux/slices/builder-slice";
import { getDefaultProps, sectionRegistry } from "@/lib/section-registry";

type BuilderCommandPaletteProps = { open: boolean; onClose: () => void };

/** A self-contained portal so no invisible modal layer can remain over the Builder canvas. */
export function BuilderCommandPalette({ open, onClose }: BuilderCommandPaletteProps) {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");

  const close = useCallback(() => {
    onClose();
    setQuery("");
    requestAnimationFrame(() => restoreFocusRef.current?.focus?.());
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); close(); }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, close]);

  const actions = useMemo(() => {
    const panels = [
      ["layers", "Open Navigator", "Search and reorder page sections"],
      ["pages", "Open Pages", "Manage store pages"],
      ["components", "Browse Sections", "Find components and sections"],
      ["templates", "Open Templates", "Browse reusable templates"],
      ["media", "Open Media", "Browse store media"],
      ["theme", "Open Settings", "Theme and advanced settings"],
    ] as const;
    const panelActions = panels.map(([id, label, hint]) => ({ id, label, hint, run: () => dispatch(setActiveTab(id)) }));
    const sections = sectionRegistry.map((section) => ({
      id: `section-${section.type}`,
      label: `Add ${section.label}`,
      hint: section.description,
      run: () => dispatch(addSection({ id: `${section.type}-${Date.now()}`, type: section.type, label: section.label, visible: true, props: getDefaultProps(section.type) })),
    }));
    return [...panelActions, ...sections];
  }, [dispatch]);

  const results = actions.filter((action) => {
    const text = query.trim().toLowerCase();
    return !text || action.label.toLowerCase().includes(text) || action.hint.toLowerCase().includes(text);
  });

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[200] grid place-items-start overflow-y-auto p-4 pt-[10vh] sm:pt-[14vh]" role="dialog" aria-modal="true" aria-label="Builder command palette">
      <button type="button" aria-label="Close command palette" className="absolute inset-0 cursor-default bg-zinc-950/25 backdrop-blur-[2px]" onMouseDown={close} />
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center border-b border-zinc-100 px-4">
          <Search className="mr-3 h-4 w-4 shrink-0 text-zinc-400" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && results[0]) { results[0].run(); close(); } }} placeholder="Search pages, sections, templates, media, or commands…" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400" />
          <button type="button" onClick={close} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Close command palette"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[min(56vh,520px)] overflow-y-auto p-2">
          {results.slice(0, 50).map((action) => <button key={action.id} type="button" onClick={() => { action.run(); close(); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-zinc-50"><span><span className="block text-sm font-medium text-zinc-800">{action.label}</span><span className="mt-0.5 block text-xs text-zinc-500">{action.hint}</span></span><span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400">↵</span></button>)}
          {!results.length && <div className="px-4 py-10 text-center"><p className="text-sm font-medium text-zinc-700">No results</p><p className="mt-1 text-xs text-zinc-500">Try a page, section, template, media item, or command.</p></div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
