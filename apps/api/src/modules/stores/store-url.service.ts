import { stripPort, isLoopbackHostname, isIpHostname } from "../../common/utils/host-resolution.js";

export type StoreLike = {
  _id?: unknown;
  slug?: string | null;
  subdomain?: string | null;
  customDomains?: string[] | null;
  customDomain?: string | null;
  [key: string]: unknown;
};

export type SSLCommerzUrlBundle = {
  storePublicUrl: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  storefrontSuccessUrl: string;
  storefrontFailUrl: string;
  storefrontCancelUrl: string;
};

/**
 * Resolves the public base URL of the store.
 * Supports:
 * 1. Verified / active custom domains (e.g. https://store.example.com)
 * 2. Multi-tenant subdomains in production (e.g. https://nayeem.bornoland.com)
 * 3. Multi-tenant subdomains in local development (e.g. http://nayeem.localhost:3000)
 */
export function getStorePublicUrl(
  store: StoreLike | null | undefined,
  options?: { host?: string; protocol?: string }
): string {
  if (!store) {
    const fallbackRoot = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || process.env.ROOT_DOMAIN || "bornoland.com").trim();
    return `https://${fallbackRoot}`;
  }

  // 1. Custom domain check (takes precedence if configured)
  const customDomains = Array.isArray(store.customDomains) ? store.customDomains : [];
  const primaryCustomDomain = customDomains[0] || (typeof store.customDomain === "string" ? store.customDomain : null);

  if (primaryCustomDomain && primaryCustomDomain.trim()) {
    const cleanDomain = stripPort(primaryCustomDomain.trim().toLowerCase());
    const isLocal = isLoopbackHostname(cleanDomain) || cleanDomain.endsWith(".localhost");
    const scheme = isLocal ? "http" : "https";
    return `${scheme}://${cleanDomain}`;
  }

  // 2. Subdomain / slug resolution
  const slugCandidate = (store.subdomain || store.slug || "").trim().toLowerCase();
  const storeSlug = slugCandidate || "store";

  // 3. Environment root domain resolution
  const rootDomain = (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    process.env.ROOT_DOMAIN ||
    ""
  ).trim().toLowerCase();

  const webUrl = (
    process.env.NEXT_PUBLIC_WEB_URL ||
    process.env.WEB_URL ||
    process.env.APP_URL ||
    ""
  ).trim();

  // If running locally in development (localhost / 127.0.0.1)
  const isDev = process.env.NODE_ENV !== "production" || rootDomain.includes("localhost") || webUrl.includes("localhost");

  if (isDev) {
    let port = "3000";
    if (rootDomain.includes(":")) {
      port = rootDomain.split(":")[1] || "3000";
    } else if (webUrl.includes(":")) {
      const match = webUrl.match(/:(\d+)/);
      if (match?.[1]) port = match[1];
    }
    return `http://${storeSlug}.localhost:${port}`;
  }

  // Production root domain resolution
  const productionBase = rootDomain ? stripPort(rootDomain) : "bornoland.com";
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL || process.env.PROTOCOL || "https";

  return `${protocol}://${storeSlug}.${productionBase}`;
}

/**
 * Resolves the central public API base URL (for webhooks, callbacks, IPN)
 */
export function getApiBaseUrl(): string {
  const envApiUrl =
    process.env.API_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "";

  if (envApiUrl && envApiUrl.trim()) {
    return envApiUrl.trim().replace(/\/$/, "");
  }

  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) {
    const port = process.env.PORT || process.env.API_PORT || "4000";
    return `http://localhost:${port}`;
  }

  return "https://api.bornoland.com";
}

/**
 * Centralized SSLCommerz URL Bundle Generator.
 * Generates tenant-aware storefront return URLs and central API IPN/callback URLs.
 */
export function getSSLCommerzCallbackUrls(params: {
  store: StoreLike;
  order?: { _id?: unknown; orderNumber?: string };
  transactionId?: string;
  apiBaseUrl?: string;
}): SSLCommerzUrlBundle {
  const { store, order, transactionId } = params;
  const storePublicUrl = getStorePublicUrl(store);
  const apiBase = params.apiBaseUrl || getApiBaseUrl();

  const queryParams = new URLSearchParams();
  if (order?.orderNumber) {
    queryParams.set("orderNumber", String(order.orderNumber));
    queryParams.set("order", String(order.orderNumber));
  }
  if (order?._id) queryParams.set("orderId", String(order._id));
  if (transactionId) queryParams.set("tran_id", String(transactionId));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const storefrontSuccessUrl = `${storePublicUrl}/checkout/payment/success${queryString}`;
  const storefrontFailUrl = `${storePublicUrl}/checkout/payment/fail${queryString}`;
  const storefrontCancelUrl = `${storePublicUrl}/checkout/payment/cancel${queryString}`;

  // Central API endpoints handle validation, update order, and redirect browser to storefront
  const successUrl = `${apiBase}/payments/sslcommerz/success`;
  const failUrl = `${apiBase}/payments/sslcommerz/fail`;
  const cancelUrl = `${apiBase}/payments/sslcommerz/cancel`;
  const ipnUrl = `${apiBase}/payments/sslcommerz/ipn`;

  return {
    storePublicUrl,
    successUrl,
    failUrl,
    cancelUrl,
    ipnUrl,
    storefrontSuccessUrl,
    storefrontFailUrl,
    storefrontCancelUrl,
  };
}
