import type {
  CourierProviderContext,
  CourierTestResult,
  CreateShipmentInput,
  CreateShipmentResult,
  TrackShipmentResult,
  CoverageCheckInput,
  CoverageCheckResult,
  CourierLocationNode,
  ICourierProvider,
} from "../courier.types.js";
import type { CourierProviderSlug } from "../courier.constants.js";

/**
 * Shared sandbox-friendly base. Concrete providers override hooks when real APIs are wired.
 * Adding a courier = extend this class + register in the factory — no business-logic changes.
 */
export abstract class BaseCourierProvider implements ICourierProvider {
  abstract readonly slug: CourierProviderSlug;
  abstract readonly name: string;

  /** Required credential keys for a valid connection (non-secret emptiness check). */
  protected abstract requiredCredentialKeys: string[];

  protected assertCredentials(ctx: CourierProviderContext): string | null {
    for (const key of this.requiredCredentialKeys) {
      if (!ctx.credentials[key]?.trim()) {
        return `Missing ${this.credentialLabel(key)}`;
      }
    }
    return null;
  }

  /** Human-readable labels for common Pathao/BD courier credential keys. */
  protected credentialLabel(key: string): string {
    const labels: Record<string, string> = {
      clientId: "Client ID",
      clientSecret: "Client Secret",
      username: "Username",
      password: "Password",
      storeId: "Store ID",
      apiKey: "API Key",
      secret: "Secret",
      secretKey: "Secret Key",
      merchantId: "Merchant ID",
      merchantCode: "Merchant Code",
    };
    return labels[key] ?? key;
  }

  async connect(ctx: CourierProviderContext): Promise<CourierTestResult> {
    return this.testConnection(ctx);
  }

  async testConnection(ctx: CourierProviderContext): Promise<CourierTestResult> {
    const missing = this.assertCredentials(ctx);
    const testedAt = new Date().toISOString();
    const environment = ctx.sandbox ? "sandbox" : "production";
    if (missing) {
      return { ok: false, message: missing, environment, testedAt };
    }
    if (ctx.sandbox) {
      return {
        ok: true,
        message: `${this.name} sandbox credentials look valid`,
        environment,
        testedAt,
      };
    }
    return this.testProductionConnection(ctx);
  }

  protected async testProductionConnection(ctx: CourierProviderContext): Promise<CourierTestResult> {
    return {
      ok: true,
      message: `${this.name} credentials configured (production)`,
      environment: "production",
      testedAt: new Date().toISOString(),
    };
  }

  async createShipment(
    ctx: CourierProviderContext,
    input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    const missing = this.assertCredentials(ctx);
    if (missing) return { ok: false, message: missing };
    if (!input.recipientName?.trim() || !input.recipientPhone?.trim() || !input.recipientAddress?.trim()) {
      return { ok: false, message: "Invalid address: name, phone, and street are required" };
    }
    if (ctx.sandbox) {
      const trackingId = `${this.slug.toUpperCase()}-SBX-${Date.now()}`;
      return {
        ok: true,
        trackingId,
        consignmentId: trackingId,
        message: "Sandbox shipment created",
        estimatedCharge: 60,
        estimatedDelivery: "1-3 business days",
        raw: { sandbox: true, input },
      };
    }
    return this.createProductionShipment(ctx, input);
  }

  protected async createProductionShipment(
    _ctx: CourierProviderContext,
    _input: CreateShipmentInput,
  ): Promise<CreateShipmentResult> {
    return { ok: false, message: `${this.name} production shipment API is not configured yet` };
  }

  async cancelShipment(
    ctx: CourierProviderContext,
    trackingId: string,
  ): Promise<{ ok: boolean; message?: string }> {
    if (!trackingId) return { ok: false, message: "Tracking ID required" };
    if (ctx.sandbox) return { ok: true, message: "Sandbox shipment cancelled" };
    return { ok: false, message: `${this.name} cancel API is not configured yet` };
  }

  async trackShipment(ctx: CourierProviderContext, trackingId: string): Promise<TrackShipmentResult> {
    if (!trackingId) return { ok: false, message: "Tracking ID required" };
    if (ctx.sandbox) {
      return {
        ok: true,
        status: "in_transit",
        events: [{ at: new Date().toISOString(), status: "in_transit", note: "Sandbox tracking" }],
      };
    }
    return { ok: false, message: `${this.name} tracking API is not configured yet` };
  }

  /**
   * Default coverage: require city; if provider returns city list, fuzzy-match.
   * Empty city catalog ⇒ assume national coverage (sandbox / stub providers).
   */
  async checkCoverage(
    ctx: CourierProviderContext,
    input: CoverageCheckInput,
  ): Promise<CoverageCheckResult> {
    const missing = this.assertCredentials(ctx);
    if (missing) {
      return {
        supported: false,
        reason: missing,
        estimatedCharge: null,
        estimatedDelivery: null,
      };
    }

    const city = (input.city || input.district || "").trim();
    if (!city) {
      return {
        supported: false,
        reason: "District/city is required for delivery coverage",
        estimatedCharge: null,
        estimatedDelivery: null,
      };
    }

    try {
      const cities = await this.getCities(ctx);
      if (cities.length > 0) {
        const needle = city.toLowerCase();
        const match = cities.find(
          (c) =>
            c.name.toLowerCase() === needle ||
            c.name.toLowerCase().includes(needle) ||
            needle.includes(c.name.toLowerCase()),
        );
        if (!match) {
          return {
            supported: false,
            reason: `Area not supported — ${city} is outside ${this.name} coverage`,
            estimatedCharge: null,
            estimatedDelivery: null,
          };
        }
        return {
          supported: true,
          matchedCity: match.name,
          estimatedCharge: ctx.sandbox ? 60 : null,
          estimatedDelivery: "1-3 business days",
        };
      }
    } catch {
      // Fall through to assume coverage when catalog API fails
    }

    return {
      supported: true,
      matchedCity: city,
      matchedZone: input.zone || undefined,
      matchedArea: input.area || undefined,
      estimatedCharge: ctx.sandbox ? 60 : null,
      estimatedDelivery: "1-3 business days",
    };
  }

  async getCities(_ctx: CourierProviderContext): Promise<CourierLocationNode[]> {
    return [];
  }

  async getZones(_ctx: CourierProviderContext, _cityId: string): Promise<CourierLocationNode[]> {
    return [];
  }

  async getAreas(_ctx: CourierProviderContext, _zoneId: string): Promise<CourierLocationNode[]> {
    return [];
  }
}
