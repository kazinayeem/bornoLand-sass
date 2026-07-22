"use client";

import { SectionWrapper, type SectionData } from "./section-renderer";
import { FooterSocialLinks } from "@/components/storefront/footer-social-links";
import { useFooterData } from "@/lib/storefront/use-footer-data";

export function FooterSocial({ section }: { section: SectionData }) {
  const p = section.props;
  const { data } = useFooterData({ sectionType: "footer-social" });
  const label = p.label || "Follow Us";

  return (
    <SectionWrapper section={section}>
      <div className="space-y-3" style={{ fontFamily: p.font || "Inter" }}>
        {label && (
          <p className="text-sm font-medium" style={{ color: p.headingColor || "#18181b" }}>
            {label}
          </p>
        )}
        <FooterSocialLinks
          links={data.socialLinks}
          style="minimal"
          iconClassName="!h-auto !w-auto"
        />
      </div>
    </SectionWrapper>
  );
}
