/** Canonical courier provider slugs — extend here when adding a new courier. */
export const COURIER_PROVIDER_SLUGS = [
  "pathao",
  "redx",
  "steadfast",
  "paperfly",
  "sundarban",
] as const;

export type CourierProviderSlug = (typeof COURIER_PROVIDER_SLUGS)[number];

export const COURIER_PROVIDER_META: Record<
  CourierProviderSlug,
  { name: string; credentialFields: Array<{ key: string; label: string; secret?: boolean }> }
> = {
  pathao: {
    name: "Pathao",
    credentialFields: [
      { key: "clientId", label: "Client ID" },
      { key: "clientSecret", label: "Client Secret", secret: true },
      { key: "username", label: "Username" },
      { key: "password", label: "Password", secret: true },
      { key: "storeId", label: "Store ID" },
    ],
  },
  redx: {
    name: "RedX",
    credentialFields: [
      { key: "apiKey", label: "API Key", secret: true },
      { key: "secret", label: "Secret", secret: true },
      { key: "storeId", label: "Store ID" },
    ],
  },
  steadfast: {
    name: "Steadfast",
    credentialFields: [
      { key: "apiKey", label: "API Key", secret: true },
      { key: "secretKey", label: "Secret Key", secret: true },
    ],
  },
  paperfly: {
    name: "Paperfly",
    credentialFields: [
      { key: "username", label: "Username" },
      { key: "password", label: "Password", secret: true },
      { key: "merchantId", label: "Merchant ID" },
    ],
  },
  sundarban: {
    name: "Sundarban",
    credentialFields: [
      { key: "apiKey", label: "API Key", secret: true },
      { key: "secret", label: "Secret", secret: true },
      { key: "merchantCode", label: "Merchant Code" },
    ],
  },
};

export const COURIER_FEATURE_KEY = "courier";

export const TRACKING_REFRESH_INTERVALS = ["5", "15", "30", "manual"] as const;
export type TrackingRefreshInterval = (typeof TRACKING_REFRESH_INTERVALS)[number];

export function isCourierProviderSlug(value: string): value is CourierProviderSlug {
  return (COURIER_PROVIDER_SLUGS as readonly string[]).includes(value);
}
