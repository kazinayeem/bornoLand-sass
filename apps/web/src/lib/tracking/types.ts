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
  sku?: string;
};

export type TrackingUserData = {
  em?: string; // email (plain or SHA-256 hashed)
  email?: string;
  ph?: string; // phone (plain or SHA-256 hashed)
  phone?: string;
  fn?: string; // first name
  firstName?: string;
  first_name?: string;
  ln?: string; // last name
  lastName?: string;
  last_name?: string;
  ct?: string; // city
  city?: string;
  st?: string; // state/division
  state?: string;
  zp?: string; // zip/postal code
  zip?: string;
  country?: string;
  external_id?: string;
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
  page_path?: string;
  search_params?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  user_data?: TrackingUserData;
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
  metaPixel?: PublicMetaPixelConfig | null;
  tiktokPixel?: PublicTikTokPixelConfig | null;
  googleAnalytics?: {
    enabled: boolean;
    measurementId: string;
  } | null;
  customTracking?: {
    enabled: boolean;
    headerScript: string;
    bodyScript: string;
  } | null;
};

export interface TrackingAdapter {
  readonly name: TrackingPlatform;
  init(config: unknown, userData?: TrackingUserData): void;
  track(eventName: StandardEventName, payload?: TrackingPayload, eventId?: string): void;
  isLoaded(): boolean;
  getPixelId?(): string;
  reset?(): void;
}

// Backward compatibility alias
export type TrackingProvider = TrackingAdapter;
