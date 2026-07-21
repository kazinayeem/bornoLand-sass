export type SectionStyle = {
  maxWidth?: string;
  paddingY?: string;
  paddingX?: string;
  marginTop?: string;
  marginBottom?: string;
  bgColor?: string;
  bgImage?: string;
  textColor?: string;
  textAlignment?: string;
  animation?: string;
  visibility?: Record<string, boolean>;
};

export type BuilderSection = {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  locked?: boolean;
  collapsed?: boolean;
  props: Record<string, string>;
  style?: SectionStyle;
};

export type BuilderPage = {
  _id: string;
  storeId: string;
  title: string;
  slug: string;
  pageType: string;
  sections: BuilderSection[];
  headerSections?: BuilderSection[];
  footerSections?: BuilderSection[];
  status: "draft" | "published" | "scheduled" | "archived";
  seo?: Record<string, string>;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
};
