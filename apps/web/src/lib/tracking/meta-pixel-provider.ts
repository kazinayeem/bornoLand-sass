import type { TrackingProvider, StandardEventName, TrackingPayload, PublicMetaPixelConfig } from "./types";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export class MetaPixelProvider implements TrackingProvider {
  readonly name = "meta" as const;
  private initialized = false;
  private pixelId = "";
  private testEventCode = "";

  init(config: PublicMetaPixelConfig): void {
    if (typeof window === "undefined") return;
    if (!config?.enabled || !config.pixelId) return;

    this.pixelId = config.pixelId.trim();
    this.testEventCode = config.testEventCode?.trim() || "";

    if (!window.fbq) {
      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
    }

    if (window.fbq) {
      window.fbq("init", this.pixelId);
      this.initialized = true;
    }
  }

  track(eventName: StandardEventName, payload: TrackingPayload = {}, eventId?: string): void {
    if (typeof window === "undefined" || !this.initialized || !window.fbq) return;

    const formattedPayload: Record<string, unknown> = {
      ...payload,
    };

    const options: Record<string, unknown> = {};
    if (eventId) {
      options.eventID = eventId;
    }
    if (this.testEventCode) {
      options.test_event_code = this.testEventCode;
    }

    try {
      if (eventName === "PageView") {
        window.fbq("track", "PageView", formattedPayload, Object.keys(options).length > 0 ? options : undefined);
      } else {
        window.fbq("track", eventName, formattedPayload, Object.keys(options).length > 0 ? options : undefined);
      }
    } catch (err) {
      console.warn("[MetaPixelProvider] Failed to fire event:", eventName, err);
    }
  }

  isLoaded(): boolean {
    return this.initialized && typeof window !== "undefined" && typeof window.fbq === "function";
  }
}
