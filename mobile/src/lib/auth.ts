// TerraVista — token storage for the mock auth flow (AsyncStorage).
// Mirrors web/src/lib/auth.ts, but async because React Native has no
// synchronous storage. A cached token copy keeps the axios interceptor fast.
// Author: Gabriel Mule (RM 560586)

import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "terravista_token";
const USER_KEY = "terravista_user";

// In-memory mirror so synchronous callers (and the API interceptor) can read
// the token without awaiting AsyncStorage on every request.
let cachedToken: string | null = null;

// Load the persisted session into memory at startup.
export async function loadSession(): Promise<void> {
  cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveSession(token: string, user: string): Promise<void> {
  cachedToken = token;
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, user],
  ]);
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export function getToken(): string | null {
  return cachedToken;
}

export async function getUser(): Promise<string | null> {
  return AsyncStorage.getItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(cachedToken);
}
