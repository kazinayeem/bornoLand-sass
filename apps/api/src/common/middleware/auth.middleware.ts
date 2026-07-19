import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getSessionCookieName, verifyAccessToken, verifySessionToken } from "../utils/jwt.js";
import { UserModel } from "../../modules/users/user.model.js";

export type AuthRequest = Request & {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
  };
};

async function acceptActiveSession(request: AuthRequest, response: Response, next: NextFunction, payload: NonNullable<AuthRequest["user"]> & { sessionVersion?: number }) {
  const user = await UserModel.findById(payload.userId).select("sessionVersion status").lean() as
    | { sessionVersion?: number; status?: string }
    | null;
  if (!user || user.status !== "active" || (user.sessionVersion ?? 0) !== (payload.sessionVersion ?? 0)) {
    return response.status(401).json({ message: "Session expired" });
  }
  request.user = payload;
  return next();
}

export async function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const cookieHeader = request.header("cookie") ?? "";
  const cookieMatch = cookieHeader.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  const cookieToken = cookieMatch?.[1];

  if (!header?.startsWith("Bearer ") && !cookieToken) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    // 1. Try Bearer token as Access Token first (short-lived JWT)
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);

      // Check if it's a short access token (verify with short expiry)
      try {
        const payload = verifyAccessToken(token);
        return await acceptActiveSession(request, response, next, payload);
      } catch {
        // Not a valid access token — fall through to cookie check
        // (might be a customer_token from localStorage)
      }

      // Try as a regular JWT session token (for customer_token backward compat)
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET ?? "") as AuthRequest["user"];
        return await acceptActiveSession(request, response, next, payload!);
      } catch {
        return response.status(401).json({ message: "Invalid token" });
      }
    }

    // 2. Fall back to session cookie (opaque refresh token or legacy JWT)
    if (cookieToken) {
      // If it's an opaque refresh token (64 hex chars), we can't decode it directly.
      // The client should use the access token for API calls.
      // But we still try to verify it as a legacy JWT for backward compat.
      if (/^[a-f0-9]{64}$/.test(cookieToken)) {
        // This is a refresh token — cannot be used as an auth token directly.
        // Return 401 so the client knows to refresh.
        return response.status(401).json({ message: "Refresh token cannot be used for API access" });
      }

      const payload = verifySessionToken(cookieToken);
      return await acceptActiveSession(request, response, next, payload);
    }

    return response.status(401).json({ message: "Unauthorized" });
  } catch {
    return response.status(401).json({ message: "Invalid token" });
  }
}
