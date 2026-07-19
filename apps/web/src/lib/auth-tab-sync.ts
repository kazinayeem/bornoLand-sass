const AUTH_SYNC_KEY = "bornoland.auth.sync";
const CHANNEL_NAME = "bornoland-auth";

/** Broadcasts an auth state change without ever storing credentials in web storage. */
export function broadcastAuthEvent(type: "logout" | "expired") {
  if (typeof window === "undefined") return;
  const payload = { type, at: Date.now() };
  try { window.localStorage.setItem(AUTH_SYNC_KEY, JSON.stringify(payload)); } catch { /* storage can be disabled */ }
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch { /* BroadcastChannel is optional */ }
}

export function subscribeToAuthEvents(callback: (type: "logout" | "expired") => void) {
  if (typeof window === "undefined") return () => undefined;
  const fromPayload = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    const type = (value as { type?: unknown }).type;
    if (type === "logout" || type === "expired") callback(type);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_SYNC_KEY || !event.newValue) return;
    try { fromPayload(JSON.parse(event.newValue)); } catch { /* ignore malformed storage events */ }
  };
  window.addEventListener("storage", onStorage);
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event) => fromPayload(event.data);
  } catch { /* BroadcastChannel is optional */ }
  return () => {
    window.removeEventListener("storage", onStorage);
    channel?.close();
  };
}
