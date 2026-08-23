"use client";

import { useCallback, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { MediaPicker } from "@/components/media/media-picker";
import type { MediaSelection } from "@/lib/media-selection";
import { cn } from "@/lib/utils";

export type RepeaterField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url" | "image";
  placeholder?: string;
};

type RepeaterEditorProps = {
  items: Record<string, string>[];
  fields: RepeaterField[];
  onUpdate: (items: Record<string, string>[]) => void;
  title?: string;
  addLabel?: string;
  storeId?: string;
  storeSlug?: string;
  mediaFolder?: string;
  minItems?: number;
};

function generateId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readRepeaterImage(item: Record<string, string>, key: string): MediaSelection {
  const url = item[key] || "";
  const mediaId = item[`${key}MediaId`];
  return mediaId ? { url, mediaId } : { url };
}

function patchRepeaterImage(
  item: Record<string, string>,
  key: string,
  selection: MediaSelection
): Record<string, string> {
  const next = { ...item, [key]: selection.url || "" };
  if (selection.mediaId) {
    next[`${key}MediaId`] = selection.mediaId;
  } else {
    delete next[`${key}MediaId`];
  }
  return next;
}

export function RepeaterEditor({
  items = [],
  fields,
  onUpdate,
  title = "Items",
  addLabel = "Add Item",
  storeId = "",
  storeSlug = "store",
  mediaFolder = "hero",
  minItems = 1,
}: RepeaterEditorProps) {
  // Track open accordion index (default: first item open)
  const [openIndices, setOpenIndices] = useState<Set<number>>(() => new Set([0]));

  const toggleOpen = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addItem = useCallback(() => {
    const newItem: Record<string, string> = { id: generateId() };
    for (const f of fields) {
      newItem[f.key] = "";
    }
    const newItems = [...items, newItem];
    onUpdate(newItems);
    setOpenIndices((prev) => new Set([...prev, newItems.length - 1]));
  }, [items, fields, onUpdate]);

  const removeItem = useCallback(
    (index: number) => {
      if (items.length <= minItems) return;
      const next = items.filter((_, i) => i !== index);
      onUpdate(next);
    },
    [items, minItems, onUpdate]
  );

  const duplicateItem = useCallback(
    (index: number) => {
      const cloned = { ...items[index], id: generateId() };
      const next = [...items.slice(0, index + 1), cloned, ...items.slice(index + 1)];
      onUpdate(next);
      setOpenIndices((prev) => new Set([...prev, index + 1]));
    },
    [items, onUpdate]
  );

  const moveItem = useCallback(
    (index: number, direction: -1 | 1) => {
      const target = index + direction;
      if (target < 0 || target >= items.length) return;
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      onUpdate(next);
    },
    [items, onUpdate]
  );

  const updateField = useCallback(
    (index: number, key: string, value: string) => {
      const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
      onUpdate(next);
    },
    [items, onUpdate]
  );

  const updateImageField = useCallback(
    (index: number, key: string, selection: MediaSelection) => {
      const next = items.map((item, i) =>
        i === index ? patchRepeaterImage(item, key, selection) : item
      );
      onUpdate(next);
    },
    [items, onUpdate]
  );

  const getItemLabel = (item: Record<string, string>, index: number) => {
    return item.title || item.name || item.badge || item.heading || `Slide ${index + 1}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {title} ({items.length})
        </span>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-[11px] font-bold text-zinc-800 hover:bg-zinc-50 transition-colors shadow-2xs"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <p className="py-3 text-center text-[11px] text-zinc-400">
          No items yet. Click &quot;{addLabel}&quot; to add one.
        </p>
      )}

      <div className="space-y-2.5">
        {items.map((item, index) => {
          const isOpen = openIndices.has(index);
          const label = getItemLabel(item, index);
          const hasImage = Boolean(item.image || item.desktopImage);

          return (
            <div
              key={item.id || index}
              className={cn(
                "rounded-xl border bg-white shadow-2xs transition-all overflow-hidden",
                isOpen ? "border-zinc-300 ring-1 ring-zinc-200" : "border-zinc-200"
              )}
            >
              {/* Header Bar */}
              <div className="flex items-center gap-1.5 bg-zinc-50/80 px-2.5 py-2 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={() => toggleOpen(index)}
                  className="flex flex-1 items-center gap-2 text-left min-w-0"
                >
                  <GripVertical className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate text-xs font-bold text-zinc-800">
                    {index + 1}. {label}
                  </span>
                  {hasImage && (
                    <span className="shrink-0 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 border border-emerald-200">
                      Image
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    title="Move Up"
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-200 disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    title="Move Down"
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-200 disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => duplicateItem(index)}
                    title="Duplicate Slide"
                    className="rounded p-1 text-zinc-500 hover:bg-zinc-200 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= minItems}
                    title="Delete Slide"
                    className="rounded p-1 text-rose-500 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleOpen(index)}
                    className="rounded p-1 text-zinc-400 hover:text-zinc-700"
                  >
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Form Content */}
              {isOpen && (
                <div className="space-y-3 p-3 animate-in fade-in-50 duration-150">
                  {fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {field.label}
                      </label>

                      {field.type === "image" ? (
                        <div className="space-y-1.5">
                          <MediaPicker
                            storeId={storeId}
                            billingHref={`/store/${storeSlug}/billing`}
                            folder={mediaFolder}
                            compact
                            hideLabel
                            allowUrlPaste
                            value={readRepeaterImage(item, field.key)}
                            onChange={(selection) =>
                              updateImageField(index, field.key, selection)
                            }
                          />
                        </div>
                      ) : field.type === "textarea" ? (
                        <textarea
                          value={item[field.key] || ""}
                          onChange={(e) => updateField(index, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={2}
                          className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-800 focus:bg-white focus:outline-none transition-colors shadow-2xs"
                        />
                      ) : (
                        <input
                          type={field.type === "url" ? "text" : field.type === "number" ? "number" : "text"}
                          value={item[field.key] || ""}
                          onChange={(e) => updateField(index, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-800 focus:bg-white focus:outline-none transition-colors shadow-2xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
