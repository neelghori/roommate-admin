import { ADMIN_ACCESS_TOKEN_COOKIE } from "./constants";
import { clearAdminSessionProfile } from "./admin-session-profile";

const STORAGE_KEY = ADMIN_ACCESS_TOKEN_COOKIE;

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function setSessionCookie(value: string): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  document.cookie = `${ADMIN_ACCESS_TOKEN_COOKIE}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function setAdminAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* ignore quota / private mode */
  }
  setSessionCookie(token);
}

export function getAdminAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearAdminAccessToken(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  clearSessionCookie();
  clearAdminSessionProfile();
}
