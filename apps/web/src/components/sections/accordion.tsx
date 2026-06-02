"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionWrapper, SectionTitle, type SectionData } from "./section-renderer";

const sampleItems = [
  { title: "Product Details", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore." },
  { title: "Shipping Information", content: "Free shipping on orders over $50. Standard delivery takes 5-7 business days." },
  { title: "Care Instructions", content: "Machine wash cold. Tumble dry low. Do not bleach. Iron on low heat if needed." },
  { title: "Warranty", content: "All products come with a 1-year manufacturer warranty against defects." },
];

export function Accordion({ section }: { section: SectionData }) {
  const p = section.props;
  const [open, setOpen] = useState<number>(p.openFirst !== "false" ? 0 : -1);
  const count = Number(p.items) || 4;
  const items = sampleItems.slice(0, count);

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-2xl px-4">
        <SectionTitle title={p.title || "Details"} subtitle="" textColor={p.textColor} textAlignment={p.textAlignment} />
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <button onClick={() => setOpen(p.multiOpen !== "false" ? (open === i ? -1 : i) : (open === i ? -1 : i))}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50">
                {item.title}
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600">{item.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
