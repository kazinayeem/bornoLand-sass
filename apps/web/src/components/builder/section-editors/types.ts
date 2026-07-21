"use client";

import type { BuilderSection, SectionStyle } from "@/redux/slices/builder-slice";

export type SectionEditorProps = {
  section: BuilderSection;
  storeId: string;
  storeSlug: string;
  brandColors?: string[];
  onPropChange: (key: string, value: string) => void;
  onPropsChange: (props: Record<string, string | undefined>) => void;
  onStyleChange: (style: Partial<SectionStyle>) => void;
};

export type SectionEditorEntry = {
  mode: "replace";
  tabs?: Array<"style" | "layout" | "responsive" | "animation" | "seo" | "advanced">;
  Component: React.ComponentType<SectionEditorProps>;
};

export {
  isHttpUrl,
  isVideoUrl,
  isGoogleMapsEmbed,
  buildMapsEmbedFromAddress,
  buildMapsEmbedFromCoords,
} from "@/lib/builder-media-urls";
