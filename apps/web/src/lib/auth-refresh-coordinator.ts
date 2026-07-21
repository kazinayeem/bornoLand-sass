"use client";

import { getApiUrl } from "@/lib/urls";
import { setAccessToken } from "@/lib/access-token";

const CHANNEL_NAME = "bornoland-auth";
const REFRESH_LOCK_KEY = "bornoland.auth.refresh-lock";
const REFRESH_RESULT_KEY = "bornoland.auth.refresh-result";
const LOCK_TTL_MS = 15_000;
const RESULT_TTL_MS = 60_000;

type RefreshResult = {
  token: string;
  at: number;
};

let inFlightRefresh: Promise<string | null> | null = null;

function readRecentRefreshResult(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REFRESH_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RefreshResult;
    if (!parsed?.token || Date.now() - parsed.at > RESULT_TTL_MS) return null;
    return parsed.token;
  } catch {
    return null;
  }
}

function writeRefreshResult(token: string) {
  if (typeof window === "undefined") return;
  const payload: RefreshResult = { token, at: Date.now() };
  try {
    window.localStorage.setItem(REFRESH_RESULT_KEY, JSON.stringify(payload));
  } catch {
    // storage can be disabled
  }
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "token-refreshed", token, at: payload.at });
    channel.close();
  } catch {
    // BroadcastChannel is optional
  }
}

async function withRefreshLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof window !== "undefined" && "locks" in navigator) {
    return navigator.locks.request("bornoland-auth-refresh", fn);
  }

  const started = Date.now();
  while (Date.now() - started < LOCK_TTL_MS) {
    const now = Date.now();
    try {
      const raw = window.localStorage.getItem(REFRESH_LOCK_KEY);
      const current = raw ? (JSON.parse(raw) as { at?: number }) : null;
      if (!current?.at || now - current.at > LOCK_TTL_MS) {
        window.localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify({ at: now }));
        try {
          return await fn();
        } finally {
          window.localStorage.removeItem(REFRESH_LOCK_KEY);
        }
      }
    } catch {
      return fn();
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return fn();
}

async function performRefresh(): Promise<string | null> {
  const cached = readRecentRefreshResult();
  if (cached) {
    setAccessToken(cached);
    return cached;
  }

  return withRefreshLock(async () => {
    const cachedAfterLock = readRecentRefreshResult();
    if (cachedAfterLock) {
      setAccessToken(cachedAfterLock);
      return cachedAfterLock;
    }

    const res = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as { data?: { accessToken?: string } };
    const token = json?.data?.accessToken;
    if (!token) return null;

    setAccessToken(token);
    writeRefreshResult(token);
    return token;
  });
}

/**
 * Performs a single refresh across all tabs. Other tabs reuse the latest token
 * instead of racing the same refresh cookie.
 */
export async function refreshAccessTokenCoordinated(): Promise<string | null> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = performRefresh().finally(() => {
    inFlightRefresh = null;
  });

  return inFlightRefresh;
}

export function subscribeToTokenRefresh(callback: (token: string) => void) {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key !== REFRESH_RESULT_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as RefreshResult;
      if (parsed?.token) callback(parsed.token);
    } catch {
      // ignore malformed payloads
    }
  };

  window.addEventListener("storage", onStorage);

  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => {
      const data = event.data as { type?: string; token?: string };
      if (data?.type === "token-refreshed" && data.token) callback(data.token);
    };
  } catch {
    // BroadcastChannel is optional
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}
