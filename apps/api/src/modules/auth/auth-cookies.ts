import type { Response } from "express";
import {
  getLegacySessionCookieOptions,
  getSessionCookieName,
  getSessionCookieOptions,
} from "../../common/utils/jwt.js";

export type SessionCookiePayload = {
  refreshToken: string;
  sessionToken: string;
  sessionMaxAge: number;
};

/** Writes both the opaque refresh token and legacy JWT session cookies. */
export function setSessionCookies(response: Response, data: SessionCookiePayload) {
  response.cookie(
    getSessionCookieName(),
    data.refreshToken,
    getSessionCookieOptions(data.sessionMaxAge)
  );
  response.cookie(
    "bornoland.session.legacy",
    data.sessionToken,
    getLegacySessionCookieOptions(data.sessionMaxAge)
  );
}

/** Clears session cookies using the same attributes they were set with. */
export function clearSessionCookies(response: Response) {
  response.clearCookie(getSessionCookieName(), getSessionCookieOptions(0));
  response.clearCookie("bornoland.session.legacy", getLegacySessionCookieOptions(0));
}
