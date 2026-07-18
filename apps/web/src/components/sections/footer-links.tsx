"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";

export function FooterLinks({ section }: { section: SectionData }) {
  const p = section.props;
  const title = p.title || "Quick Links";
  const columns = parseInt(p.columns || "3");
  const links = [
    { text: p.link1Text || "Home", url: p.link1Url || "/" },
    { text: p.link2Text || "Shop", url: p.link2Url || "/shop" },
    { text: p.link3Text || "About", url: p.link3Url || "/about" },
    { text: p.link4Text || "Contact", url: p.link4Url || "/contact" },
    { text: p.link5Text || "FAQ", url: p.link5Url || "/faq" },
    { text: p.link6Text || "Privacy", url: p.link6Url || "/privacy" },
    { text: p.link7Text || "Terms", url: p.link7Url || "/terms" },
    { text: p.link8Text || "Shipping", url: p.link8Url || "/shipping" },
    { text: p.link9Text || "Returns", url: p.link9Url || "/returns" },
  ].filter((l) => l.text);

  const linkColor = p.linkColor || "#71717a";
  const headingColor = p.headingColor || "#18181b";
  const chunkSize = Math.ceil(links.length / columns);

  return (
    <SectionWrapper section={section}>
      <div className="space-y-4" style={{ fontFamily: p.font || "Inter" }}>
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: headingColor }}>
            {title}
          </h3>
        )}
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIdx) => (
            <ul key={colIdx} className="space-y-2">
              {links.slice(colIdx * chunkSize, (colIdx + 1) * chunkSize).map((link) => (
                <li key={link.text}>
                  <span
                    className="cursor-pointer text-sm transition-colors hover:text-zinc-900"
                    style={{ color: linkColor }}
                  >
                    {link.text}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
