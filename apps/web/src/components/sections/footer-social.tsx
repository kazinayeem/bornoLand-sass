"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function FooterSocial({ section }: { section: SectionData }) {
  const p = section.props;
  const iconColor = p.iconColor || "#71717a";
  const iconSize = parseInt(p.iconSize || "18");
  const hoverColor = p.hoverColor || "#2563eb";
  const label = p.label || "Follow Us";

  return (
    <SectionWrapper section={section}>
      <div className="space-y-3" style={{ fontFamily: p.font || "Inter" }}>
        {label && (
          <p className="text-sm font-medium" style={{ color: p.headingColor || "#18181b" }}>
            {label}
          </p>
        )}
        <div className="flex items-center gap-3">
          {p.showFacebook !== "false" && (
            <Facebook
              style={{ color: iconColor, width: iconSize, height: iconSize }}
              className="cursor-pointer transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = iconColor; }}
            />
          )}
          {p.showTwitter !== "false" && (
            <Twitter
              style={{ color: iconColor, width: iconSize, height: iconSize }}
              className="cursor-pointer transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = iconColor; }}
            />
          )}
          {p.showInstagram !== "false" && (
            <Instagram
              style={{ color: iconColor, width: iconSize, height: iconSize }}
              className="cursor-pointer transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = iconColor; }}
            />
          )}
          {p.showYoutube !== "false" && (
            <Youtube
              style={{ color: iconColor, width: iconSize, height: iconSize }}
              className="cursor-pointer transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = iconColor; }}
            />
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
