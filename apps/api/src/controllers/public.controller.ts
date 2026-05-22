import type { Response } from "express";
import type { SubdomainRequest } from "../middleware/subdomain.middleware.js";
import { resolveBySubdomain } from "../services/tenant-resolver.service.js";
import { sendFailure, sendSuccess } from "../utils/api-response.js";

/**
 * GET /public/tenant
 *
 * Resolves the current tenant/store from the subdomain in the Host header.
 * Used by Next.js middleware to fetch tenant data for public site rendering.
 *
 * Examples:
 *   Visit test.localhost.com:3002 → subdomain="test" → looks up store with subdomain="test"
 */
export async function resolveTenantFromSubdomainController(request: SubdomainRequest, response: Response) {
  const host = request.headers["host"] ?? "";
  const slug = request.subdomain;
  if (!slug) {
    return sendFailure(response, "No subdomain detected", 404);
  }

  const result = await resolveBySubdomain(slug);
  if (!result.ok || !result.data) {
    return sendFailure(response, result.message ?? "Tenant not found", 404);
  }

  return sendSuccess(response, result.data);
}

/**
 * GET /public/tenant/:subdomain
 *
 * Resolves a tenant/store by explicit subdomain slug in the URL path.
 * Useful for debugging or direct access.
 */
export async function resolveTenantBySlugController(request: SubdomainRequest, response: Response) {
  const slug = request.params.subdomain as string;
  if (!slug) {
    return sendFailure(response, "Subdomain slug required", 400);
  }

  const result = await resolveBySubdomain(slug);
  if (!result.ok || !result.data) {
    return sendFailure(response, result.message ?? "Tenant not found", 404);
  }

  return sendSuccess(response, result.data);
}

/**
 * GET /public/tenant-by-host
 *
 * Alternative lookup that reads subdomain from a query param
 * (useful for server-side calls where host header may not be set).
 */
export async function resolveTenantByHostController(request: SubdomainRequest, response: Response) {
  const slug = (request.query.subdomain as string) ?? request.subdomain;
  if (!slug) {
    return sendFailure(response, "Subdomain required", 400);
  }

  const result = await resolveBySubdomain(slug);
  if (!result.ok || !result.data) {
    return sendFailure(response, result.message ?? "Tenant not found", 404);
  }

  return sendSuccess(response, result.data);
}
