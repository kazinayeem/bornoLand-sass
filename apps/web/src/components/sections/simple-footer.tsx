"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";

export function SimpleFooter({ section }: { section: SectionData }) {
  const p = section.props;
  return (
    <SectionWrapper section={section}>
      <div className={`px-4 sm:px-6 lg:px-8 ${p.layout === "split" ? "flex items-center justify-between" : "text-center"}`} style={{ color: p.textColor || "#fafafa" }}>
        {p.layout === "split" && (
          <div className="text-sm">{p.copyright || "© 2026 Your Store"}</div>
        )}
        {p.showSocial !== "false" && (
          <div className="flex justify-center gap-4 mb-3">
            {["𝕏", "📷", "💼", "📘"].map((s) => (
              <span key={s} className="opacity-60 hover:opacity-100 cursor-pointer text-sm">{s}</span>
            ))}
          </div>
        )}
        {p.layout !== "split" && (
          <p className="text-sm opacity-60">{p.copyright || "© 2026 Your Store. All rights reserved."}</p>
        )}
      </div>
    </SectionWrapper>
  );
}
