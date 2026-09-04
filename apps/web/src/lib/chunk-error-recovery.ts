"use client";

/**
 * Utility to identify, log, and recover from Webpack / Next.js dynamic chunk loading failures.
 *
 * Root Cause:
 * When Next.js deploys a new production build, older chunk hashes are replaced.
 * Active user tabs or stale browser caches might request obsolete JS chunks (e.g. `page-xyz.js`).
 * Webpack throws `ChunkLoadError: Loading chunk <id> failed`.
 *
 * Recovery Strategy:
 * 1. Detect if the error is a ChunkLoadError / dynamic import failure.
 * 2. Attempt a single automatic page reload per path using sessionStorage guards (avoids reload loops).
 * 3. If automatic reload fails or was already attempted, display a polished recovery UI with manual reload.
 */

const CHUNK_RETRY_PREFIX = "bornoland_chunk_retry_";
const RETRY_WINDOW_MS = 20000; // 20 seconds cooldown

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;

  const errObj = error as { name?: string; message?: string; stack?: string };
  const name = errObj.name || "";
  const message = errObj.message || "";
  const stack = errObj.stack || "";

  if (name === "ChunkLoadError") return true;

  const chunkErrorPatterns = [
    /loading chunk/i,
    /loading css chunk/i,
    /failed to fetch dynamically imported module/i,
    /error loading dynamically imported module/i,
    /importing a module script failed/i,
    /cannot find module/i,
    /missing chunk/i,
    /unexpected token '<'/i, // Often returned when server serves 404 HTML instead of JS chunk
  ];

  return chunkErrorPatterns.some((pattern) => pattern.test(message) || pattern.test(stack));
}

export function attemptChunkReload(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const key = `${CHUNK_RETRY_PREFIX}${window.location.pathname}`;
    const lastRetry = sessionStorage.getItem(key);
    const now = Date.now();

    if (lastRetry && now - Number(lastRetry) < RETRY_WINDOW_MS) {
      // Already tried reloading recently on this path; avoid infinite reload loop
      return false;
    }

    sessionStorage.setItem(key, String(now));
    console.warn("[ChunkRecovery] Detected stale Next.js chunk. Performing automatic reload.");
    window.location.reload();
    return true;
  } catch {
    // If sessionStorage is restricted (e.g. private mode quota), fallback to single reload
    window.location.reload();
    return true;
  }
}

export function triggerHardReload(): void {
  if (typeof window === "undefined") return;

  try {
    const key = `${CHUNK_RETRY_PREFIX}${window.location.pathname}`;
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("_v", String(Date.now()));
    window.location.href = url.toString();
  } catch {
    window.location.reload();
  }
}
