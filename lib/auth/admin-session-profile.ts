import { ADMIN_SESSION_PROFILE_KEY } from "./constants";

export type AdminSessionProfile = {
  fullName: string;
  email: string;
};

function deepPickString(obj: unknown, keys: string[]): string | null {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) return null;
  const o = obj as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  for (const v of Object.values(o)) {
    const found = deepPickString(v, keys);
    if (found) return found;
  }
  return null;
}

/**
 * Derive display name + email from a typical login JSON body.
 * Falls back to `loginEmail` for email when the payload has none.
 */
export function profileFromLoginRaw(
  raw: unknown,
  loginEmail: string,
): AdminSessionProfile {
  const email =
    deepPickString(raw, ["email", "userEmail"]) ?? loginEmail.trim();
  const first = deepPickString(raw, ["firstName", "first_name"]);
  const last = deepPickString(raw, ["lastName", "last_name"]);
  const composed = [first, last].filter(Boolean).join(" ").trim();
  const fullName =
    deepPickString(raw, [
      "name",
      "fullName",
      "full_name",
      "displayName",
      "display_name",
    ]) ||
    composed ||
    "";
  return { fullName, email };
}

export function setAdminSessionProfile(profile: AdminSessionProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ADMIN_SESSION_PROFILE_KEY,
      JSON.stringify(profile),
    );
  } catch {
    /* ignore */
  }
}

export function getAdminSessionProfile(): AdminSessionProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SESSION_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    const email = typeof o.email === "string" ? o.email : "";
    const fullName = typeof o.fullName === "string" ? o.fullName : "";
    if (!email && !fullName) return null;
    return { email, fullName };
  } catch {
    return null;
  }
}

export function clearAdminSessionProfile(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ADMIN_SESSION_PROFILE_KEY);
  } catch {
    /* ignore */
  }
}
