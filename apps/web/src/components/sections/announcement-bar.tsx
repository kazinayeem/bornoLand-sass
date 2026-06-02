"use client";

import { useState } from "react";
import { X, Megaphone } from "lucide-react";
import { type SectionData } from "./section-renderer";

export function AnnouncementBar({ section }: { section: SectionData }) {
  const p = section.props;
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative" style={{ backgroundColor: p.bgColor || "#18181b" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-center">
        {p.showEmoji !== "false" && <Megaphone className="h-4 w-4" style={{ color: p.textColor || "#ffffff" }} />}
        <span className="text-xs font-medium" style={{ color: p.textColor || "#ffffff" }}>
          {p.text || "Free shipping on orders over $50!"}
        </span>
        {p.link && (
          <a href={p.link} className="text-xs font-semibold underline" style={{ color: p.textColor || "#ffffff" }}>
            {p.linkText || "Shop Now"}
          </a>
        )}
        {p.dismissible !== "false" && (
          <button onClick={() => setDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: p.textColor || "#ffffff" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
