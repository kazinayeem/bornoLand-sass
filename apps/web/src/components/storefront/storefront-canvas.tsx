import { SectionRenderer, type SectionData } from "@/components/sections/section-renderer";
import type { StorefrontSectionLike } from "./storefront-types";

type StorefrontCanvasProps = {
  sections: StorefrontSectionLike[];
};

function toSectionData(s: StorefrontSectionLike): SectionData {
  const props: Record<string, string> = {};
  if (s.props) {
    for (const [key, value] of Object.entries(s.props)) {
      props[key] = value == null ? "" : String(value);
    }
  }
  return { id: s.id, type: s.type, visible: s.visible, props };
}

export function StorefrontCanvas({ sections }: StorefrontCanvasProps) {
  const visibleSections = sections.filter((section) => section.visible !== false);

  if (visibleSections.length === 0) {
    return <main />;
  }

  return (
    <main>
      {visibleSections.map((section) => (
        <SectionRenderer key={section.id} section={toSectionData(section)} />
      ))}
    </main>
  );
}
