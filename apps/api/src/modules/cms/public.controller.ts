import type { Response } from "express";
import type { SubdomainRequest } from "../../common/middleware/subdomain.middleware.js";
import { sendFailure, sendSuccess } from "../../common/utils/api-response.js";
import { resolveStoreKeyForRequest } from "../../common/utils/host-resolution.js";
import { findStoreByHostKey, resolveBySubdomain } from "../stores/tenant-resolver.service.js";
import { getProductBySlug } from "../products/product.service.js";
import { getPublicProducts } from "../products/product.service.js";
import { getEnabledPaymentMethods } from "../payments/payment-method.service.js";
import { getEnabledDeliveryZones } from "../delivery/delivery-zone.service.js";

export async function resolveTenantFromSubdomainController(
  request: SubdomainRequest,
  response: Response
) {
  const slug = request.subdomain;
  if (!slug) return sendFailure(response, "No subdomain found");

  const pageSlug = typeof request.query.page === "string" ? request.query.page : undefined;
  const result = await resolveBySubdomain(slug, pageSlug);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message ?? "Not found", 404);
}

export async function resolveTenantBySlugController(
  request: SubdomainRequest,
  response: Response
) {
  const slug = request.params.subdomain as string;
  if (!slug) return sendFailure(response, "Subdomain slug required");

  const pageSlug = typeof request.query.page === "string" ? request.query.page : undefined;
  const result = await resolveBySubdomain(slug, pageSlug);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message ?? "Not found", 404);
}

/**
 * Resolve storefront from any Host value (subdomain, custom domain, IP-wildcard).
 * DB is the source of truth after host classification.
 */
export async function resolveTenantByHostController(
  request: SubdomainRequest,
  response: Response
) {
  const hostHeader =
    typeof request.query.host === "string"
      ? request.query.host
      : typeof request.headers["x-forwarded-host"] === "string"
        ? request.headers["x-forwarded-host"]
        : (request.headers.host ?? "");

  let key =
    typeof request.query.subdomain === "string"
      ? request.query.subdomain
      : request.subdomain ?? null;

  if (!key && hostHeader) {
    key = resolveStoreKeyForRequest(hostHeader).storeKey;
  }

  if (!key) {
    return sendSuccess(response, {
      kind: "platform",
      store: null,
      tenant: null,
    });
  }

  const store = await findStoreByHostKey(key);
  if (!store) {
    return sendFailure(response, "Store not found", 404);
  }

  const canonical =
    String((store as { subdomain?: string }).subdomain || (store as { slug?: string }).slug || key);
  const pageSlug = typeof request.query.page === "string" ? request.query.page : undefined;
  const result = await resolveBySubdomain(canonical, pageSlug);
  return result.ok
    ? sendSuccess(response, { kind: "tenant", ...result.data })
    : sendFailure(response, result.message ?? "Not found", 404);
}

export async function resolveProductByHostController(
  request: SubdomainRequest,
  response: Response
) {
  const slug = request.subdomain;
  const productSlug = request.params.slug as string;

  if (!slug) return sendFailure(response, "No subdomain found", 404);
  if (!productSlug) return sendFailure(response, "Product slug required", 400);

  const site = await resolveBySubdomain(slug);
  if (!site.ok || !site.data?.store) {
    return sendFailure(response, site.message ?? "Store not found", 404);
  }

  const productResult = await getProductBySlug(String(site.data.store._id), productSlug);
  if (!productResult.ok || !productResult.data?.product) {
    return sendFailure(response, productResult.message ?? "Product not found", 404);
  }

  const product = productResult.data.product as Record<string, unknown>;
  const relatedProducts = (site.data.products ?? [])
    .filter((item) => String(item._id) !== String(product._id) && String((item as any).category ?? "").toLowerCase() === String((product as any).category ?? "").toLowerCase())
    .slice(0, 8);

  return sendSuccess(response, {
    store: site.data.store,
    tenant: site.data.tenant,
    settings: site.data.settings,
    sliders: site.data.sliders,
    products: site.data.products,
    product,
    relatedProducts,
  });
}

export async function resolveProductBySlugController(
  request: SubdomainRequest,
  response: Response
) {
  const storeSlug = request.params.storeSlug as string;
  const productSlug = request.params.productSlug as string;
  if (!storeSlug || !productSlug)
    return sendFailure(response, "Store slug and product slug required");

  const result = await getProductBySlug(storeSlug, productSlug);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message, 404);
}

export async function getPublicProductsController(
  request: SubdomainRequest,
  response: Response
) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const result = await getPublicProducts(storeId, request.query as Record<string, unknown>);
  return sendSuccess(response, result.data);
}

export async function paymentMethodsController(
  request: SubdomainRequest,
  response: Response
) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const result = await getEnabledPaymentMethods(storeId);
  return sendSuccess(response, result.data);
}

export async function deliveryZonesController(
  request: SubdomainRequest,
  response: Response
) {
  const storeId = request.store?._id?.toString();
  if (!storeId) return sendFailure(response, "Store not found", 404);

  const result = await getEnabledDeliveryZones(storeId);
  return sendSuccess(response, result.data);
}
