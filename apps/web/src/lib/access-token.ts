// In-memory access token storage (not persisted to localStorage)
// Access token is short-lived (15 min) and stored only in JS memory.
let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  // Reset refresh promise when token is set
  refreshPromise = null;
}

// Deduplicated refresh: if multiple requests trigger refresh simultaneously,
// only one actual refresh call is made.
export function setRefreshPromise(promise: Promise<string | null>): void {
  refreshPromise = promise;
}

export function getRefreshPromise(): Promise<string | null> | null {
  return refreshPromise;
}

export function clearRefreshPromise(): void {
  refreshPromise = null;
}
