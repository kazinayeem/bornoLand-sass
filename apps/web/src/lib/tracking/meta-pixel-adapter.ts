import type {
  TrackingAdapter,
  StandardEventName,
  TrackingPayload,
  PublicMetaPixelConfig,
  TrackingUserData,
} from "./types";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Normalizes user data for Meta Advanced Matching.
 * Meta accepts raw strings (which the snippet hashes client-side before sending)
 * or pre-hashed SHA-256 strings.
 */
function sanitizeAdvancedMatching(data?: TrackingUserData): Record<string, string> {
  if (!data) return {};
  const formatted: Record<string, string> = {};

  const email = (data.em || data.email || "").trim().toLowerCase();
  if (email) formatted.em = email;

  const phone = (data.ph || data.phone || "").replace(/[^0-9+]/g, "");
  if (phone) formatted.ph = phone;

  const firstName = (data.fn || data.firstName || data.first_name || "").trim().toLowerCase();
  if (firstName) formatted.fn = firstName;

  const lastName = (data.ln || data.lastName || data.last_name || "").trim().toLowerCase();
  if (lastName) formatted.ln = lastName;

  const city = (data.ct || data.city || "").trim().toLowerCase().replace(/[\s\d]/g, "");
  if (city) formatted.ct = city;

  const state = (data.st || data.state || "").trim().toLowerCase();
  if (state) formatted.st = state;

  const zip = (data.zp || data.zip || "").trim().toLowerCase().replace(/[\s-]/g, "");
  if (zip) formatted.zp = zip;

  const country = (data.country || "").trim().toLowerCase();
  if (country) formatted.country = country;

  if (data.external_id) formatted.external_id = String(data.external_id);

  return formatted;
}

export class MetaPixelAdapter implements TrackingAdapter {
  readonly name = "meta" as const;
  private initialized = false;
  private pixelId = "";
  private advancedMatching = false;
  private testEventCode = "";
  private initialPageViewFired = false;

  public init(config: PublicMetaPixelConfig, userData?: TrackingUserData): void {
    if (typeof window === "undefined") return;
    if (!config?.enabled || !config.pixelId) return;

    const trimmedId = config.pixelId.trim();
    if (!trimmedId) return;

    this.pixelId = trimmedId;
    this.advancedMatching = Boolean(config.advancedMatching);
    this.testEventCode = config.testEventCode?.trim() || "";

    // Inject Meta base script if not already present
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
        if (s && s.parentNode) {
          s.parentNode.insertBefore(t, s);
        } else if (b.head) {
          b.head.appendChild(t);
        }
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      /* eslint-enable */
    }

    if (window.fbq) {
      const advancedData = this.advancedMatching ? sanitizeAdvancedMatching(userData) : undefined;
      if (advancedData && Object.keys(advancedData).length > 0) {
        window.fbq("init", this.pixelId, advancedData);
      } else {
        window.fbq("init", this.pixelId);
      }
      this.initialized = true;
    }
  }

  public track(
    eventName: StandardEventName,
    payload: TrackingPayload = {},
    eventId?: string
  ): void {
    if (typeof window === "undefined" || !this.initialized || !window.fbq) return;

    const options: Record<string, unknown> = {};
    if (eventId) {
      options.eventID = eventId;
    }
    if (this.testEventCode) {
      options.test_event_code = this.testEventCode;
    }

    const formattedPayload = this.formatPayloadForMeta(eventName, payload);
    const hasOptions = Object.keys(options).length > 0;

    try {
      if (eventName === "PageView") {
        this.initialPageViewFired = true;
        if (Object.keys(formattedPayload).length > 0 || hasOptions) {
          window.fbq("track", "PageView", formattedPayload, hasOptions ? options : undefined);
        } else {
          window.fbq("track", "PageView");
        }
      } else if (eventName === "Custom") {
        const customName = String(payload.custom_event_name || "CustomEvent");
        window.fbq("trackCustom", customName, formattedPayload, hasOptions ? options : undefined);
      } else {
        window.fbq("track", eventName, formattedPayload, hasOptions ? options : undefined);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[MetaPixelAdapter] Failed to fire event:", eventName, err);
      }
    }
  }

  private formatPayloadForMeta(
    eventName: StandardEventName,
    payload: TrackingPayload
  ): Record<string, unknown> {
    const formatted: Record<string, unknown> = {};

    if (payload.content_name) formatted.content_name = payload.content_name;
    if (payload.content_category) formatted.content_category = payload.content_category;

    if (payload.content_ids && Array.isArray(payload.content_ids)) {
      formatted.content_ids = payload.content_ids.map(String);
    }

    if (payload.content_type) {
      formatted.content_type = payload.content_type;
    } else if (
      eventName === "ViewContent" ||
      eventName === "AddToCart" ||
      eventName === "InitiateCheckout" ||
      eventName === "Purchase"
    ) {
      formatted.content_type = "product";
    }

    if (typeof payload.value === "number") {
      formatted.value = payload.value;
    }

    if (payload.currency) {
      formatted.currency = payload.currency;
    }

    if (payload.search_string) {
      formatted.search_string = payload.search_string;
    }

    if (typeof payload.num_items === "number") {
      formatted.num_items = payload.num_items;
    }

    if (payload.order_id) {
      formatted.order_id = payload.order_id;
    }

    if (payload.contents && Array.isArray(payload.contents)) {
      formatted.contents = payload.contents.map((item) => ({
        id: String(item.id),
        quantity: item.quantity || 1,
        item_price: typeof item.price === "number" ? item.price : undefined,
      }));
    }

    // Pass additional metadata safely
    if (payload.page_path) formatted.page_path = payload.page_path;
    if (payload.search_params) formatted.search_params = payload.search_params;

    // Clean undefined keys
    Object.keys(formatted).forEach((key) => {
      if (formatted[key] === undefined) delete formatted[key];
    });

    return formatted;
  }

  public isLoaded(): boolean {
    return this.initialized && typeof window !== "undefined" && typeof window.fbq === "function";
  }

  public getPixelId(): string {
    return this.pixelId;
  }

  public reset(): void {
    this.initialized = false;
    this.pixelId = "";
    this.initialPageViewFired = false;
  }
}

// Backward compatibility alias
export { MetaPixelAdapter as MetaPixelProvider };
