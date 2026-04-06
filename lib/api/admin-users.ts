import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";

export const ADMIN_USERS_PATH = "/api/v1/admin/users";

export type AdminAccountStatus = "active" | "inactive";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  adminRole: string;
  accountStatus: AdminAccountStatus;
  lastLogin: string;
};

function buildUrl(path: string): string {
  return `${getPublicApiBaseUrl()}${path}`;
}

function pickString(
  o: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function pickAccountStatus(
  o: Record<string, unknown>,
): AdminAccountStatus {
  const explicit = pickString(o, ["accountStatus"]);
  if (explicit === "active" || explicit === "inactive") return explicit;

  if (typeof o.isActive === "boolean") {
    return o.isActive ? "active" : "inactive";
  }
  if (typeof o.active === "boolean") {
    return o.active ? "active" : "inactive";
  }

  const status = pickString(o, ["status", "state"])?.toLowerCase();
  if (status === "active" || status === "enabled") return "active";
  if (
    status === "inactive" ||
    status === "disabled" ||
    status === "suspended"
  ) {
    return "inactive";
  }

  return "active";
}

function formatLastLogin(value: string | null): string {
  if (!value) return "—";
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value;

  const diffSec = Math.round((t - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const abs = Math.abs(diffSec);

  if (abs < 60) return rtf.format(Math.round(diffSec), "second");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 604800), "week");
  return new Date(t).toLocaleDateString();
}

function mapItemToRow(raw: unknown): AdminUserRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const id = pickString(o, ["id", "_id", "userId", "adminId"]);
  if (!id) return null;

  const email = pickString(o, ["email"]) ?? "—";
  const first = pickString(o, ["firstName", "first_name"]);
  const last = pickString(o, ["lastName", "last_name"]);
  const composed = [first, last].filter(Boolean).join(" ").trim();
  const name =
    pickString(o, ["name", "fullName", "full_name", "displayName"]) ||
    composed ||
    email;

  const adminRole =
    pickString(o, [
      "adminRole",
      "role",
      "roleName",
      "role_name",
      "title",
    ]) ?? "Admin";

  const lastLoginRaw = pickString(o, [
    "lastLogin",
    "lastLoginAt",
    "last_login_at",
    "lastSeenAt",
    "last_seen_at",
    "updatedAt",
    "updated_at",
  ]);

  return {
    id,
    name,
    email,
    adminRole,
    accountStatus: pickAccountStatus(o),
    lastLogin: formatLastLogin(lastLoginRaw),
  };
}

function extractUsersArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;

  for (const key of ["data", "users", "items", "results", "admins"]) {
    const v = d[key];
    if (Array.isArray(v)) return v;
  }

  const inner = d.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const o = inner as Record<string, unknown>;
    for (const key of ["users", "items", "results", "admins"]) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }

  return [];
}

export type FetchAdminUsersSuccess = {
  ok: true;
  users: AdminUserRow[];
};

export type FetchAdminUsersFailure = {
  ok: false;
  message: string;
  status: number;
};

export type FetchAdminUsersResult = FetchAdminUsersSuccess | FetchAdminUsersFailure;

export type CreateAdminUserRequest = {
  fullName: string;
  email: string;
  password: string;
};

export type CreateAdminUserSuccess = { ok: true; raw: unknown };
export type CreateAdminUserFailure = {
  ok: false;
  message: string;
  status: number;
};
export type CreateAdminUserResult =
  | CreateAdminUserSuccess
  | CreateAdminUserFailure;

/**
 * POST /api/v1/admin/users — create another admin panel user (Bearer).
 * Tweak JSON keys if your API expects e.g. `name`.
 */
export async function postCreateAdminUser(
  accessToken: string,
  body: CreateAdminUserRequest,
): Promise<CreateAdminUserResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_USERS_PATH), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fullName: body.fullName.trim(),
        email: body.email.trim(),
        password: body.password,
      }),
    });
  } catch {
    return {
      ok: false,
      message: "Cannot reach server. Is the API running?",
      status: 0,
    };
  }

  let data: unknown = null;
  try {
    const text = await res.text();
    if (text) data = JSON.parse(text) as unknown;
  } catch {
    data = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(
        data,
        res.status,
        "Could not create admin user.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

/**
 * GET /api/v1/admin/users with Bearer token.
 */
export async function fetchAdminUsers(
  accessToken: string,
): Promise<FetchAdminUsersResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_USERS_PATH), {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    return {
      ok: false,
      message: "Cannot reach server. Is the API running?",
      status: 0,
    };
  }

  let body: unknown = null;
  try {
    const text = await res.text();
    if (text) body = JSON.parse(text) as unknown;
  } catch {
    body = null;
  }

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(
        body,
        res.status,
        "Could not load admin users.",
      ),
      status: res.status,
    };
  }

  const rows = extractUsersArray(body)
    .map(mapItemToRow)
    .filter((r): r is AdminUserRow => r !== null);

  return { ok: true, users: rows };
}
