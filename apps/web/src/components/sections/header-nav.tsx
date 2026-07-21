"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { BuilderLink } from "./builder-link";

export function HeaderNav({ section }: { section: SectionData }) {
  const p = section.props;
  const link1 = { text: p.link1Text || "Home", url: p.link1Url || "/" };
  const link2 = { text: p.link2Text || "Shop", url: p.link2Url || "/shop" };
  const link3 = { text: p.link3Text || "About", url: p.link3Url || "/about" };
  const link4 = { text: p.link4Text || "Contact", url: p.link4Url || "/contact" };
  const link5 = { text: p.link5Text || "", url: p.link5Url || "" };
  const links = [link1, link2, link3, link4, link5].filter((l) => l.text);
  const linkColor = p.linkColor || "#52525b";
  const hoverColor = p.hoverColor || "#18181b";
  const fontSize = p.fontSize || "14";
  const gap = p.gap || "24";
  const alignment = p.alignment || "left";

  return (
    <SectionWrapper section={section}>
      <div
        className={`flex items-center gap-${gap} ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"}`}
        style={{ fontFamily: p.font || "Inter" }}
      >
        {links.map((link) => (
          <BuilderLink
            key={link.text}
            href={link.url}
            className="font-medium transition-colors hover:text-apple-ink"
            style={{ color: linkColor, fontSize: `${fontSize}px` }}
            onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = linkColor; }}
          >
            {link.text}
          </BuilderLink>
        ))}
      </div>
    </SectionWrapper>
  );
}
