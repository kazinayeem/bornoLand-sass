export type StorefrontSectionLike = {
  id: string;
  type: string;
  visible?: boolean;
  props?: Record<string, string | number | boolean | null | undefined>;
};