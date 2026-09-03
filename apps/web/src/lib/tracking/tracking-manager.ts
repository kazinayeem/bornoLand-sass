import type {
  TrackingAdapter,
  StandardEventName,
  TrackingPayload,
  PublicStoreTracking,
  TrackingPlatform,
  TrackingUserData,
} from "./types";
import { MetaPixelAdapter } from "./meta-pixel-adapter";
import { TikTokPixelAdapter } from "./tiktok-pixel-adapter";

export class TrackingManager {
  private adapters: Map<TrackingPlatform, TrackingAdapter> = new Map();
  private storeId = "";
  private isBuilderPreview = false;
  private isInitialized = false;
  private currentConfig: PublicStoreTracking | null = null;
  private firedEvents: Set<string> = new Set();
  private userData: TrackingUserData = {};

  constructor() {
    this.adapters.set("meta", new MetaPixelAdapter());
    this.adapters.set("tiktok", new TikTokPixelAdapter());
  }

  public registerAdapter(platform: TrackingPlatform, adapter: TrackingAdapter): void {
    this.adapters.set(platform, adapter);
  }

  public getAdapter(platform: TrackingPlatform): TrackingAdapter | undefined {
    return this.adapters.get(platform);
  }

  public setUserData(userData: TrackingUserData): void {
    this.userData = { ...this.userData, ...userData };
  }

  public init(
    storeId: string,
    config?: PublicStoreTracking | null,
    isBuilderPreview = false,
    userData?: TrackingUserData
  ): void {
    if (typeof window === "undefined") return;

    this.storeId = storeId || "";
    this.isBuilderPreview = isBuilderPreview;
    this.currentConfig = config || null;
    if (userData) {
      this.userData = { ...this.userData, ...userData };
    }

    if (this.isBuilderPreview) {
      this.isInitialized = true;
      return;
    }

    if (!config) {
      this.isInitialized = true;
      return;
    }

    // Initialize Meta Pixel if enabled and has pixel ID
    if (config.metaPixel?.enabled && config.metaPixel.pixelId) {
      const meta = this.adapters.get("meta");
      meta?.init(config.metaPixel, this.userData);
    }

    // Initialize TikTok Pixel if enabled and has pixel ID
    if (config.tiktokPixel?.enabled && config.tiktokPixel.pixelId) {
      const tiktok = this.adapters.get("tiktok");
      tiktok?.init(config.tiktokPixel, this.userData);
    }

    this.isInitialized = true;
  }

  /**
   * Generates or sanitizes an event ID for deduplication across platforms.
   */
  public generateEventId(eventName: StandardEventName, payload: TrackingPayload = {}): string {
    if (payload.event_id && typeof payload.event_id === "string") {
      return payload.event_id;
    }
    if (eventName === "Purchase" && payload.order_id) {
      return `purchase_${payload.order_id}`;
    }
    if (eventName === "ViewContent" && payload.content_ids?.[0]) {
      const windowTime = Math.floor(Date.now() / 3000); // 3-second dedupe window for ViewContent
      return `view_${payload.content_ids[0]}_${windowTime}`;
    }
    return `${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Main dispatch method for all storefront e-commerce actions.
   */
  public track(
    eventName: StandardEventName,
    payload: TrackingPayload = {},
    customEventId?: string
  ): void {
    if (typeof window === "undefined") return;

    const eventId = customEventId || this.generateEventId(eventName, payload);

    // Prevent duplicate firing if already processed
    if (this.firedEvents.has(eventId)) {
      return;
    }
    this.firedEvents.add(eventId);

    // Keep memory cache within bounds
    if (this.firedEvents.size > 200) {
      const iterator = this.firedEvents.values();
      for (let i = 0; i < 50; i++) {
        const item = iterator.next().value;
        if (item) this.firedEvents.delete(item);
      }
    }

    // Protection for builder preview
    if (this.isBuilderPreview) {
      return;
    }

    // Merge global user data if not in payload
    const mergedPayload: TrackingPayload = {
      ...payload,
      user_data: {
        ...this.userData,
        ...(payload.user_data || {}),
      },
    };

    // Dispatch to all loaded adapters
    this.adapters.forEach((adapter) => {
      if (adapter.isLoaded()) {
        adapter.track(eventName, mergedPayload, eventId);
      }
    });

    // Fire non-blocking debug event log to store internal log if storeId exists
    if (this.storeId && !this.isBuilderPreview) {
      this.logToBackend(eventName, payload);
    }
  }

  private logToBackend(eventName: StandardEventName, payload: TrackingPayload): void {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
      const endpoint = `${baseUrl}/public/stores/${encodeURIComponent(this.storeId)}/tracking/events`;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          platform: "all",
          status: "sent",
          payloadSummary: {
            value: payload.value,
            currency: payload.currency,
            items: payload.contents?.length || payload.content_ids?.length || 0,
            orderId: payload.order_id,
            pagePath: payload.page_path,
          },
        }),
      }).catch(() => {
        // Silently ignore debug log errors
      });
    } catch {
      // Silently ignore
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
}

export const trackingManager = new TrackingManager();
