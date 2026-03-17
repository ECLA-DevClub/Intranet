export type AuthTokens = {
  access: string;
  refresh: string;
};

export type CurrentUser = {
  id: number;
  username: string;
  email: string;
  role: "admin" | "manager" | "employee";
  department: number | null;
};

const ACCESS_KEY = "intranet-access-token";
const REFRESH_KEY = "intranet-refresh-token";
const USER_KEY = "intranet-current-user";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: AuthTokens): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export function getStoredUser(): CurrentUser | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: CurrentUser): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(USER_KEY);
}

export function logoutLocal(): void {
  clearTokens();
  clearStoredUser();
}
