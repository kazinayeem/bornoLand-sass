"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { BuilderLink } from "./builder-link";

export function HeaderLogo({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <BuilderLink href="/" className="flex items-center gap-2" style={{ fontFamily: p.font || "Inter" }}>
      {p.logoUrl ? (
        <img src={p.logoUrl} alt={p.storeName || "Store"} className="rounded-lg object-contain"
          style={{ height: `${p.logoHeight || 32}px`, width: `${p.logoHeight || 32}px` }} />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: p.primaryColor || "#2563eb" }}>
          {(p.storeName || "S")[0]}
        </div>
      )}
      {p.showName !== "false" && (
        <span className="text-lg font-bold text-zinc-900">{p.storeName || "Store"}</span>
      )}
    </BuilderLink>
  );
}
