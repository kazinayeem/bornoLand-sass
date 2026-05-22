import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getSessionCookieName, verifySessionToken } from "../utils/jwt.js";

export type AuthRequest = Request & {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
  };
};

export function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const header = request.header("authorization");
  const cookieHeader = request.header("cookie") ?? "";
  const cookieMatch = cookieHeader.match(new RegExp(`${getSessionCookieName()}=([^;]+)`));
  const cookieToken = cookieMatch?.[1];

  if (!header?.startsWith("Bearer ") && !cookieToken) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header?.startsWith("Bearer ") ? header.slice(7) : cookieToken!;
    const payload = (header?.startsWith("Bearer ") ? jwt.verify(token, process.env.JWT_SECRET ?? "") : verifySessionToken(token)) as AuthRequest["user"];
    request.user = payload;
    return next();
  } catch {
    return response.status(401).json({ message: "Invalid token" });
  }
}