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
