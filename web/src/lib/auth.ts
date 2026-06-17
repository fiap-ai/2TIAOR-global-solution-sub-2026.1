// TerraVista — minimal token storage for the mock auth flow.
// Author: Gabriel Mule (RM 560586)

const TOKEN_KEY = "terravista_token";
const USER_KEY = "terravista_user";

export function saveSession(token: string, user: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, user);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
