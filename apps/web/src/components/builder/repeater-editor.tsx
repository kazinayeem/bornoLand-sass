"use client";

import { useCallback } from "react";
import { Plus, Trash2, Copy, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type RepeaterField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "url";
  placeholder?: string;
};

type RepeaterEditorProps = {
  items: Record<string, string>[];
  fields: RepeaterField[];
  onUpdate: (items: Record<string, string>[]) => void;
  title?: string;
  addLabel?: string;
};

function generateId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function RepeaterEditor({
  items = [],
  fields,
  onUpdate,
  title = "Items",
  addLabel = "Add Item",
}: RepeaterEditorProps) {
  const addItem = useCallback(() => {
    const newItem: Record<string, string> = { id: generateId() };
    for (const f of fields) {
      newItem[f.key] = "";
    }
    onUpdate([...items, newItem]);
  }, [items, fields, onUpdate]);

  const removeItem = useCallback((index: number) => {
    const next = items.filter((_, i) => i !== index);
    onUpdate(next);
  }, [items, onUpdate]);

  const duplicateItem = useCallback((index: number) => {
    const cloned = { ...items[index], id: generateId() };
    const next = [...items.slice(0, index + 1), cloned, ...items.slice(index + 1)];
    onUpdate(next);
  }, [items, onUpdate]);

  const moveItem = useCallback((index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onUpdate(next);
  }, [items, onUpdate]);

  const updateField = useCallback((index: number, key: string, value: string) => {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onUpdate(next);
  }, [items, onUpdate]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-apple-ink-muted-48">{title}</span>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2 py-1 text-[10px] font-medium text-apple-ink-muted-80 hover:bg-apple-canvas-parchment"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <p className="py-3 text-center text-[11px] text-apple-ink-muted-48">No items yet. Click &quot;{addLabel}&quot; to add one.</p>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center gap-1 border-b border-zinc-100 px-2 py-1.5">
              <GripVertical className="h-3 w-3 text-zinc-300" />
              <span className="flex-1 truncate text-[10px] font-medium text-apple-ink-muted-80">
                {fields[0] ? (item[fields[0].key] || `Item ${index + 1}`) : `Item ${index + 1}`}
              </span>
              <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0}
                className="rounded p-0.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 disabled:opacity-30">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}
                className="rounded p-0.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80 disabled:opacity-30">
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => duplicateItem(index)}
                className="rounded p-0.5 text-apple-ink-muted-48 hover:bg-apple-canvas-parchment hover:text-apple-ink-muted-80">
                <Copy className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => removeItem(index)}
                className="rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-1.5 p-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="mb-0.5 block text-[9px] font-medium text-apple-ink-muted-48">{field.label}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={item[field.key] || ""}
                      onChange={(e) => updateField(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={2}
                      className="w-full resize-none rounded-md border border-zinc-200 bg-apple-canvas-parchment px-2 py-1 text-[10px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
                    />
                  ) : (
                    <input
                      type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
                      value={item[field.key] || ""}
                      onChange={(e) => updateField(index, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-md border border-zinc-200 bg-apple-canvas-parchment px-2 py-1 text-[10px] text-apple-ink-muted-80 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
