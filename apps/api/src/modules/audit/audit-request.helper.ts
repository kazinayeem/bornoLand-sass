import { randomUUID } from "node:crypto";
import type { Request } from "express";
import type { AuthRequest } from "../../common/middleware/auth.middleware.js";
import { getClientIp, parseUserAgent } from "./audit.utils.js";

export type AuditRequestContext = {
  ipAddress: string;
  userAgent: string;
  browser: string;
  operatingSystem: string;
  device: string;
  sessionId: string;
  country: string;
  city: string;
  actorId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  tenantId?: string;
};

export function buildAuditRequestContext(request: Request | AuthRequest): AuditRequestContext {
  const userAgent = request.header("user-agent") ?? "";
  const parsed = parseUserAgent(userAgent);
  const authRequest = request as AuthRequest;

  return {
    ipAddress: getClientIp(request),
    userAgent,
    browser: parsed.browser,
    operatingSystem: parsed.os,
    device: parsed.device,
    sessionId: request.header("x-session-id") ?? randomUUID(),
    country: request.header("cf-ipcountry") ?? request.header("x-vercel-ip-country") ?? "",
    city: request.header("x-vercel-ip-city") ?? "",
    actorId: authRequest.user?.userId,
    actorRole: authRequest.user?.role,
    tenantId: authRequest.user?.tenantId,
  };
}
