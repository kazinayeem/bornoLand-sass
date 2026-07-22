import type { NextFunction, Request, Response } from "express";
import { getSessionCookieName, verifyAccessToken, verifySessionToken } from "../utils/jwt.js";
import { UserModel } from "../../modules/users/user.model.js";

export type AuthRequest = Request & {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
  };
};

async function acceptActiveSession(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
  payload: NonNullable<AuthRequest["user"]> & { sessionVersion?: number },
) {
  if (!payload?.userId) {
    return response.status(401).json({ message: "Invalid token" });
  }

  const user = (await UserModel.findById(payload.userId).select("sessionVersion status").lean()) as
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
    // 1. Prefer short-lived merchant access token.
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);
      try {
        const payload = verifyAccessToken(token);
        return await acceptActiveSession(request, response, next, payload);
      } catch {
        // Expired/invalid access token — do NOT treat customer JWTs as merchant
        // sessions. Fall through to cookie so the client can refresh.
      }
    }

    // 2. Session cookie: opaque refresh token or legacy JWT.
    if (cookieToken) {
      if (/^[a-f0-9]{64}$/.test(cookieToken)) {
        // Opaque refresh tokens cannot authorize API calls directly.
        return response.status(401).json({ message: "Refresh token cannot be used for API access" });
      }

      try {
        const payload = verifySessionToken(cookieToken);
        return await acceptActiveSession(request, response, next, payload);
      } catch {
        return response.status(401).json({ message: "Invalid token" });
      }
    }

    return response.status(401).json({ message: "Unauthorized" });
  } catch {
    return response.status(401).json({ message: "Invalid token" });
  }
}
