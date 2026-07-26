import type { CourierProviderSlug, TrackingRefreshInterval } from "./courier.constants.js";

export type CourierConnectionStatus = "connected" | "not_connected" | "error";

export type CourierCredentials = Record<string, string>;

export type CourierShipmentSettings = {
  autoCreateShipment: boolean;
  autoSyncTracking: boolean;
  autoRefreshTracking: TrackingRefreshInterval;
  codEnabled: boolean;
  defaultWeightKg: number;
  defaultDeliveryType: string;
};

export type CourierTestResult = {
  ok: boolean;
  message: string;
  environment: "sandbox" | "production";
  testedAt: string;
};

export type CreateShipmentInput = {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity?: string;
  recipientZone?: string;
  recipientArea?: string;
  amount: number;
  weightKg?: number;
  itemDescription?: string;
  specialInstruction?: string;
  packageType?: string;
  cod: boolean;
};

export type CreateShipmentResult = {
  ok: boolean;
  trackingId?: string;
  consignmentId?: string;
  message?: string;
  estimatedCharge?: number;
  estimatedDelivery?: string;
  raw?: unknown;
};

export type CoverageCheckInput = {
  city?: string;
  zone?: string;
  area?: string;
  district?: string;
  address?: string;
};

export type CoverageCheckResult = {
  supported: boolean;
  reason?: string;
  estimatedCharge?: number | null;
  estimatedDelivery?: string | null;
  matchedCity?: string;
  matchedZone?: string;
  matchedArea?: string;
};

export type TrackShipmentResult = {
  ok: boolean;
  status?: string;
  events?: Array<{ at: string; status: string; note?: string }>;
  message?: string;
  raw?: unknown;
};

export type CourierLocationNode = {
  id: string;
  name: string;
};

export type CourierProviderContext = {
  storeId: string;
  provider: CourierProviderSlug;
  sandbox: boolean;
  credentials: CourierCredentials;
};

/**
 * Provider contract — implement this interface for every courier.
 * Factory returns instances; business logic never imports concrete classes.
 */
export interface ICourierProvider {
  readonly slug: CourierProviderSlug;
  readonly name: string;
  /** Authenticate / establish session with the courier API (optional for key-based providers). */
  connect(ctx: CourierProviderContext): Promise<CourierTestResult>;
  testConnection(ctx: CourierProviderContext): Promise<CourierTestResult>;
  createShipment(ctx: CourierProviderContext, input: CreateShipmentInput): Promise<CreateShipmentResult>;
  cancelShipment(ctx: CourierProviderContext, trackingId: string): Promise<{ ok: boolean; message?: string }>;
  trackShipment(ctx: CourierProviderContext, trackingId: string): Promise<TrackShipmentResult>;
  checkCoverage(ctx: CourierProviderContext, input: CoverageCheckInput): Promise<CoverageCheckResult>;
  getCities(ctx: CourierProviderContext): Promise<CourierLocationNode[]>;
  getZones(ctx: CourierProviderContext, cityId: string): Promise<CourierLocationNode[]>;
  getAreas(ctx: CourierProviderContext, zoneId: string): Promise<CourierLocationNode[]>;
}
