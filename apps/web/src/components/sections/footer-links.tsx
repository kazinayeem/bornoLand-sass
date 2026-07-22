"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { BuilderLink } from "./builder-link";
import { useFooterData } from "@/lib/storefront/use-footer-data";

export function FooterLinks({ section }: { section: SectionData }) {
  const p = section.props;
  const { data } = useFooterData({ sectionType: "footer-links" });
  const title = p.title || "Quick Links";
  const columns = parseInt(p.columns || "3");
  const links = [...data.quickLinks, ...data.supportLinks, ...data.policyLinks];
  const linkColor = p.linkColor || "#71717a";
  const headingColor = p.headingColor || "#18181b";
  const chunkSize = Math.max(1, Math.ceil(links.length / columns));

  return (
    <SectionWrapper section={section}>
      <div className="space-y-4" style={{ fontFamily: p.font || "Inter" }}>
        {title && (
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: headingColor }}>
            {title}
          </h3>
        )}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIdx) => (
            <ul key={colIdx} className="space-y-2">
              {links.slice(colIdx * chunkSize, (colIdx + 1) * chunkSize).map((link) => (
                <li key={link._id ?? link.title}>
                  <BuilderLink
                    href={link.link || "#"}
                    className="text-sm transition-colors hover:text-apple-ink"
                    style={{ color: linkColor }}
                  >
                    {link.title}
                  </BuilderLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
