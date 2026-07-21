import * as SecureStore from "expo-secure-store";
import type { SessionPayload, SessionUser } from "../types/domain";

const AUTH_STORAGE_KEY = "bornoland.auth.session.v1";

export type StoredAuthSession = {
  accessToken: string;
  session: SessionPayload;
  user: SessionUser;
};

const storageOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

export async function loadAuthSession(): Promise<StoredAuthSession | null> {
  const stored = await SecureStore.getItemAsync(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<StoredAuthSession>;
    if (!parsed.accessToken || !parsed.session || !parsed.user) {
      await clearAuthSession();
      return null;
    }
    return parsed as StoredAuthSession;
  } catch {
    await clearAuthSession();
    return null;
  }
}

export async function saveAuthSession(value: StoredAuthSession) {
  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, JSON.stringify(value), storageOptions);
}

export async function updateStoredAccessToken(accessToken: string) {
  const current = await loadAuthSession();
  if (!current) return;
  await saveAuthSession({ ...current, accessToken });
}

export async function clearAuthSession() {
  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}
