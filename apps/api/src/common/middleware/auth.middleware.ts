import type { NextFunction, Request, Response } from "express";
import { getSessionCookieName, verifyAccessToken, verifySessionToken } from "../utils/jwt.js";
import { UserModel } from "../../modules/users/user.model.js";

export type AuthRequest = Request & {
  user?: {
    id: string;
    userId: string;
    tenantId: string;
    role: string;
    email?: string;
  };
};

async function acceptActiveSession(
  request: AuthRequest,
  response: Response,
  next: NextFunction,
  payload: { userId: string; tenantId: string; role: string; email?: string; sessionVersion?: number },
) {
  if (!payload?.userId) {
    return response.status(401).json({ message: "Invalid token" });
  }

  const user = (await UserModel.findById(payload.userId).select("sessionVersion status role tenantId mustChangePassword").lean()) as
    | { sessionVersion?: number; status?: string; role?: string; tenantId?: unknown; mustChangePassword?: boolean }
    | null;
  if (!user || user.status !== "active" || (user.sessionVersion ?? 0) !== (payload.sessionVersion ?? 0)) {
    return response.status(401).json({ message: "Session expired" });
  }

  if (user.mustChangePassword) {
    const path = (request.originalUrl || request.path || "").split("?")[0];
    const allowedWhileMustChange = [
      "/profile/change-password",
      "/auth/logout",
      "/auth/me",
      "/auth/refresh",
    ];
    const allowed = allowedWhileMustChange.some((route) => path === route || path.endsWith(route));
    if (!allowed) {
      return response.status(403).json({
        success: false,
        message: "You must create a new password before continuing.",
        code: "PASSWORD_CHANGE_REQUIRED",
      });
    }
  }
  request.user = {
    id: String(payload.userId),
    userId: String(payload.userId),
    tenantId: String(user.tenantId ?? payload.tenantId ?? ""),
    role: user.role ?? payload.role,
    email: payload.email,
  };
  return next();
}

export async function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const cookieHeader = request.header("cookie") ?? "";
  const legacyMatch = cookieHeader.match(/bornoland\.session\.legacy=([^;]+)/);
  const legacyToken = legacyMatch?.[1];

  const cookieMatch = cookieHeader.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  const cookieToken = cookieMatch?.[1];

  if (!header?.startsWith("Bearer ") && !legacyToken && !cookieToken) {
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
        // Expired/invalid access token — fall through to cookies
      }
    }

    // 2. Legacy JWT session token (written alongside refresh token for SSR / middleware)
    if (legacyToken) {
      try {
        const payload = verifySessionToken(legacyToken);
        return await acceptActiveSession(request, response, next, payload);
      } catch {
        // Expired/invalid legacy token — fall through to main session cookie
      }
    }

    // 3. Main session cookie: may be a JWT or an opaque refresh token
    if (cookieToken) {
      if (/^[a-f0-9]{64}$/.test(cookieToken)) {
        try {
          const { sessionFromRefreshToken } = await import("../../modules/auth/auth.service.js");
          const result = await sessionFromRefreshToken(cookieToken, { rotate: false });
          if (result.ok && result.data?.session) {
            return await acceptActiveSession(request, response, next, result.data.session);
          }
        } catch {
          // Fall through to 401
        }
        return response.status(401).json({ message: "Session expired" });
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
