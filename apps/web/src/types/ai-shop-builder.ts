export interface AiGenerateShopRequest {
  storeType: string;
  description: string;
  style?: string;
  language?: "bn" | "en" | string;
  storeName?: string;
  targetAudience?: string;
}

export interface AiGeneratedSection {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  props: Record<string, any>;
}

export interface AiGeneratedShopConfig {
  storeName: string;
  storeType: string;
  themeId: string;
  style: string;
  tagline: string;
  description: string;
  tokens: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      textMuted: string;
      border: string;
    };
    typography: {
      fontFamily: string;
      headingFont: string;
    };
    layout: {
      borderRadius: number;
      shadowSize: string;
      spacing: number;
    };
  };
  sections: AiGeneratedSection[];
  navigation: {
    items: Array<{ label: string; href: string }>;
  };
  announcement?: {
    enabled: boolean;
    text: string;
  };
}
