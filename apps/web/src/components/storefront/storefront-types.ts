export type SectionStyle = {
  paddingTop?: string; paddingBottom?: string; paddingLeft?: string; paddingRight?: string;
  marginTop?: string; marginBottom?: string; marginLeft?: string; marginRight?: string;
  backgroundColor?: string; backgroundGradient?: string;
  borderColor?: string; borderWidth?: string; borderRadius?: string; borderStyle?: string;
  shadow?: string; opacity?: string;
  width?: string; maxWidth?: string; minHeight?: string;
  hideOnDesktop?: boolean; hideOnTablet?: boolean; hideOnMobile?: boolean;
  customCss?: string;
  animation?: string; animationDuration?: string; animationDelay?: string;
};

export type StorefrontSectionLike = {
  id: string;
  type: string;
  visible?: boolean;
  props?: Record<string, string | number | boolean | null | undefined>;
  style?: SectionStyle;
};