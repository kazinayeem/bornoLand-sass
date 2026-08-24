import type {
  TrackingAdapter,
  StandardEventName,
  TrackingPayload,
  PublicTikTokPixelConfig,
  TrackingUserData,
} from "./types";

declare global {
  interface Window {
    ttq?: any;
    TiktokAnalyticsObject?: string;
  }
}

// Map BornoLand standard event names to TikTok Pixel event names
const TIKTOK_EVENT_MAP: Record<StandardEventName, string> = {
  PageView: "PageView",
  ViewContent: "ViewContent",
  Search: "Search",
  AddToCart: "AddToCart",
  InitiateCheckout: "InitiateCheckout",
  AddPaymentInfo: "AddPaymentInfo",
  Purchase: "CompletePayment",
  Lead: "SubmitForm",
  CompleteRegistration: "CompleteRegistration",
  Custom: "Custom",
};

export class TikTokPixelAdapter implements TrackingAdapter {
  readonly name = "tiktok" as const;
  private initialized = false;
  private pixelId = "";
  private testEventCode = "";

  public init(config: PublicTikTokPixelConfig, userData?: TrackingUserData): void {
    if (typeof window === "undefined") return;
    if (!config?.enabled || !config.pixelId) return;

    const trimmedId = config.pixelId.trim();
    if (!trimmedId) return;

    this.pixelId = trimmedId;
    this.testEventCode = config.testEventCode?.trim() || "";

    if (!window.ttq) {
      /* eslint-disable */
      (function (w: any, d: any, t: any) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie",
        ];
        ttq.setAndDefer = function (t: any, e: any) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) {
          ttq.setAndDefer(ttq, ttq.methods[i]);
        }
        ttq.instance = function (t: any) {
          var e = ttq._i[t] || [];
          for (var n = 0; n < ttq.methods.length; n++) {
            ttq.setAndDefer(e, ttq.methods[n]);
          }
          return e;
        };
        ttq.load = function (e: any, n?: any) {
          var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = i;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          var o = d.createElement("script");
          o.type = "text/javascript";
          o.async = !0;
          o.src = i + "?sdkid=" + e + "&lib=" + t;
          var a = d.getElementsByTagName("script")[0];
          if (a && a.parentNode) {
            a.parentNode.insertBefore(o, a);
          } else if (d.head) {
            d.head.appendChild(o);
          }
        };
      })(window, document, "ttq");
      /* eslint-enable */
    }

    if (window.ttq) {
      window.ttq.load(this.pixelId);
      if (userData?.email || userData?.phone) {
        window.ttq.identify({
          email: userData.email || userData.em,
          phone_number: userData.phone || userData.ph,
        });
      }
      this.initialized = true;
    }
  }

  public track(
    eventName: StandardEventName,
    payload: TrackingPayload = {},
    eventId?: string
  ): void {
    if (typeof window === "undefined" || !this.initialized || !window.ttq) return;

    const tiktokEventName = TIKTOK_EVENT_MAP[eventName] || eventName;

    const formattedPayload: Record<string, unknown> = {
      content_name: payload.content_name,
      content_category: payload.content_category,
      content_id: payload.content_ids?.[0],
      content_type: payload.content_type || "product",
      value: payload.value,
      currency: payload.currency || "BDT",
      query: payload.search_string,
      quantity: payload.num_items,
      contents: payload.contents?.map((c) => ({
        content_id: c.id,
        content_name: c.name,
        content_category: c.category,
        price: c.price,
        quantity: c.quantity || 1,
      })),
    };

    // Remove undefined properties
    Object.keys(formattedPayload).forEach((k) => {
      if (formattedPayload[k] === undefined) delete formattedPayload[k];
    });

    const options: Record<string, unknown> = {};
    if (eventId) {
      options.event_id = eventId;
    }

    try {
      if (eventName === "PageView") {
        window.ttq.page();
      } else {
        window.ttq.track(tiktokEventName, formattedPayload, Object.keys(options).length > 0 ? options : undefined);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[TikTokPixelAdapter] Failed to fire event:", eventName, err);
      }
    }
  }

  public isLoaded(): boolean {
    return this.initialized && typeof window !== "undefined" && typeof window.ttq === "object";
  }

  public getPixelId(): string {
    return this.pixelId;
  }

  public reset(): void {
    this.initialized = false;
    this.pixelId = "";
  }
}

// Backward compatibility alias
export { TikTokPixelAdapter as TikTokPixelProvider };
