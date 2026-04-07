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

function getAuthStorage(): Storage | null {
  if (!hasWindow()) return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  const storage = getAuthStorage();
  return storage?.getItem(ACCESS_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  const storage = getAuthStorage();
  return storage?.getItem(REFRESH_KEY) ?? null;
}

export function setTokens(tokens: AuthTokens): void {
  const storage = getAuthStorage();
  if (!storage) return;
  storage.setItem(ACCESS_KEY, tokens.access);
  storage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  const storage = getAuthStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_KEY);
  storage.removeItem(REFRESH_KEY);
}

export function getStoredUser(): CurrentUser | null {
  const storage = getAuthStorage();
  if (!storage) return null;
  const raw = storage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: CurrentUser): void {
  const storage = getAuthStorage();
  if (!storage) return;
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  const storage = getAuthStorage();
  if (!storage) return;
  storage.removeItem(USER_KEY);
}

export function logoutLocal(): void {
  clearTokens();
  clearStoredUser();
}
