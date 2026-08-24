export type TrackingPlatform = "meta" | "tiktok" | "google_analytics" | "custom";

export type StandardEventName =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Custom";

export type TrackingItem = {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
  brand?: string;
};

export type TrackingPayload = {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: TrackingItem[];
  content_type?: "product" | "product_group";
  value?: number;
  currency?: string;
  search_string?: string;
  num_items?: number;
  order_id?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
};

export type PublicMetaPixelConfig = {
  enabled: boolean;
  pixelId: string;
  advancedMatching?: boolean;
  automaticEvents?: boolean;
  testEventCode?: string;
};

export type PublicTikTokPixelConfig = {
  enabled: boolean;
  pixelId: string;
  automaticEvents?: boolean;
  testEventCode?: string;
};

export type PublicStoreTracking = {
  metaPixel?: PublicMetaPixelConfig;
  tiktokPixel?: PublicTikTokPixelConfig;
  googleAnalytics?: {
    enabled: boolean;
    measurementId: string;
  };
  customTracking?: {
    enabled: boolean;
    headerScript: string;
    bodyScript: string;
  };
};

export interface TrackingProvider {
  readonly name: TrackingPlatform;
  init(config: unknown): void;
  track(eventName: StandardEventName, payload: TrackingPayload, eventId?: string): void;
  isLoaded(): boolean;
}
