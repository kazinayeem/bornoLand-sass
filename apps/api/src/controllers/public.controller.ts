import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";
import { resolveBySubdomain } from "../services/tenant-resolver.service.js";
import { getProductBySlug } from "../services/product.service.js";
import { getEnabledPaymentMethods } from "../services/payment-method.service.js";
import { getEnabledDeliveryZones } from "../services/delivery-zone.service.js";

export async function resolveTenantFromSubdomainController(
  request: SubdomainRequest,
  response: Response
) {
  const slug = request.subdomain;
  if (!slug) return sendFailure(response, "No subdomain found");

  const result = await resolveBySubdomain(slug);
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

  const result = await resolveBySubdomain(slug);
  return result.ok
    ? sendSuccess(response, result.data)
    : sendFailure(response, result.message ?? "Not found", 404);
}

export async function resolveTenantByHostController(
  request: SubdomainRequest,
  response: Response
) {
  const slug =
    typeof request.query.subdomain === "string"
      ? request.query.subdomain
      : request.subdomain;
  if (!slug) return sendFailure(response, "No subdomain found");

  const result = await resolveBySubdomain(slug);
  return result.ok
    ? sendSuccess(response, result.data)
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
