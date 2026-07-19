import type {
  FaqItemData, AccordionItemData, TeamMemberData, TrustBadgeData,
  TestimonialItemData, GalleryItemData, SlideData, DeviceStyle,
} from "@/redux/slices/builder-slice";

export type SectionStyle = {
  paddingTop?: string; paddingBottom?: string; paddingLeft?: string; paddingRight?: string;
  marginTop?: string; marginBottom?: string; marginLeft?: string; marginRight?: string;
  backgroundColor?: string; backgroundGradient?: string;
  backgroundImage?: string; backgroundSize?: string; backgroundPosition?: string; backgroundRepeat?: string; backgroundAttachment?: string;
  overlayColor?: string; overlayOpacity?: string; blur?: string; backdropBlur?: string;
  borderColor?: string; borderWidth?: string; borderRadius?: string; borderStyle?: string;
  shadow?: string; opacity?: string;
  width?: string; maxWidth?: string; minHeight?: string;
  height?: string; maxHeight?: string; minWidth?: string;
  hideOnDesktop?: boolean; hideOnTablet?: boolean; hideOnMobile?: boolean;
  customCss?: string;
  animation?: string; animationDuration?: string; animationDelay?: string; animationTrigger?: string;
  parallaxSpeed?: string; sticky?: boolean;
  fontFamily?: string; fontSize?: string; fontWeight?: string; letterSpacing?: string;
  textTransform?: string; textDecoration?: string; color?: string;
  display?: string; flexDirection?: string; alignItems?: string; justifyContent?: string;
  flexWrap?: string; gap?: string;
  position?: string; top?: string; right?: string; bottom?: string; left?: string; zIndex?: string;
  transform?: string; transformOrigin?: string;
  backgroundVideoUrl?: string;
  backgroundVideoPoster?: string;
  backgroundVideoMuted?: string;
  backgroundVideoLoop?: string;
  faqItems?: FaqItemData[];
  accordionItems?: AccordionItemData[];
  teamMembers?: TeamMemberData[];
  trustBadgeItems?: TrustBadgeData[];
  testimonialItems?: TestimonialItemData[];
  galleryItems?: GalleryItemData[];
  slides?: SlideData[];
  sliderAutoplay?: string; sliderLoop?: string; sliderDelay?: string;
  sliderTransitionSpeed?: string; sliderTransition?: string;
  sliderShowArrows?: string; sliderShowDots?: string;
  responsive?: Partial<Record<"desktop" | "laptop" | "tablet" | "mobile", DeviceStyle>>;
};

export type StorefrontSectionLike = {
  id: string;
  type: string;
  visible?: boolean;
  props?: Record<string, string | number | boolean | null | undefined>;
  style?: SectionStyle;
};