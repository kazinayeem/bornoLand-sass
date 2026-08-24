import type {
  TrackingProvider,
  StandardEventName,
  TrackingPayload,
  PublicStoreTracking,
  TrackingPlatform,
} from "./types";
import { MetaPixelProvider } from "./meta-pixel-provider";
import { TikTokPixelProvider } from "./tiktok-pixel-provider";

class TrackingManager {
  private providers: Map<TrackingPlatform, TrackingProvider> = new Map();
  private storeId = "";
  private isBuilderPreview = false;
  private isInitialized = false;
  private firedEvents: Set<string> = new Set();

  constructor() {
    this.providers.set("meta", new MetaPixelProvider());
    this.providers.set("tiktok", new TikTokPixelProvider());
  }

  public init(storeId: string, config?: PublicStoreTracking | null, isBuilderPreview = false): void {
    if (typeof window === "undefined") return;
    this.storeId = storeId;
    this.isBuilderPreview = isBuilderPreview;

    if (this.isBuilderPreview) {
      this.isInitialized = true;
      return;
    }

    if (!config) return;

    // Initialize Meta Pixel if enabled and has ID
    if (config.metaPixel?.enabled && config.metaPixel.pixelId) {
      const meta = this.providers.get("meta");
      meta?.init(config.metaPixel);
    }

    // Initialize TikTok Pixel if enabled and has ID
    if (config.tiktokPixel?.enabled && config.tiktokPixel.pixelId) {
      const tiktok = this.providers.get("tiktok");
      tiktok?.init(config.tiktokPixel);
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

    // Keep memory cache clean
    if (this.firedEvents.size > 200) {
      const iterator = this.firedEvents.values();
      for (let i = 0; i < 50; i++) {
        const item = iterator.next().value;
        if (item) this.firedEvents.delete(item);
      }
    }

    // Protection for builder preview and development
    if (this.isBuilderPreview) {
      return;
    }

    // Dispatch to all loaded providers
    this.providers.forEach((provider) => {
      if (provider.isLoaded()) {
        provider.track(eventName, payload, eventId);
      }
    });

    // Fire non-blocking debug event log to store internal log if storeId exists
    if (this.storeId && !this.isBuilderPreview) {
      this.logToBackend(eventName, payload);
    }
  }

  private logToBackend(eventName: StandardEventName, payload: TrackingPayload) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      fetch(`${baseUrl}/stores/${this.storeId}/tracking/events`, {
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
          },
        }),
      }).catch(() => {
        // Silently ignore log failures
      });
    } catch {
      // Silently ignore
    }
  }
}

export const trackingManager = new TrackingManager();
