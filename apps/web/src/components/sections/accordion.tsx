"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

export function Accordion({ section }: { section: SectionData }) {
  const p = section.props;
  const [open, setOpen] = useState<number>(p.openFirst !== "false" ? 0 : -1);
  const items = (section.style?.accordionItems ?? []) as { id: string; title: string; content: string }[];
  if (items.length === 0) {
    return (
      <SectionWrapper section={section}>
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <SectionTitle title={p.title || "Details"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
          <p className="mt-4 text-sm text-apple-ink-muted-48">No accordion items yet. Add them in the Content tab.</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-2xl px-4">
        <SectionTitle title={p.title || "Details"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <button onClick={() => setOpen(p.multiOpen !== "false" ? (open === i ? -1 : i) : (open === i ? -1 : i))}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-apple-ink hover:bg-apple-canvas-parchment">
                {item.title}
                <ChevronDown className={`h-4 w-4 text-apple-ink-muted-48 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="border-t border-zinc-100 px-4 py-3 text-sm text-apple-ink-muted-80">{item.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
