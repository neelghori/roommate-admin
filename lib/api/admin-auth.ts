import { getPublicApiBaseUrl } from "@/lib/env";

export const ADMIN_LOGIN_PATH = "/api/v1/admin/auth/login";
export const ADMIN_FORGOT_PASSWORD_PATH = "/api/v1/admin/auth/forgot-password";
export const ADMIN_RESET_PASSWORD_PATH = "/api/v1/admin/auth/reset-password";
export const ADMIN_CHANGE_PASSWORD_PATH = "/api/v1/admin/auth/change-password";

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminForgotPasswordRequest = {
  email: string;
};

export type AdminResetPasswordRequest = {
  token: string;
  password: string;
};

export type AdminChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AdminLoginSuccess = {
  ok: true;
  token: string | null;
  raw: unknown;
};

export type AdminLoginFailure = {
  ok: false;
  message: string;
  status: number;
};

export type AdminLoginResult = AdminLoginSuccess | AdminLoginFailure;

export type AdminSimpleSuccess = {
  ok: true;
  raw: unknown;
};

export type AdminSimpleFailure = {
  ok: false;
  message: string;
  status: number;
};

export type AdminSimpleResult = AdminSimpleSuccess | AdminSimpleFailure;

function buildUrl(path: string): string {
  return `${getPublicApiBaseUrl()}${path}`;
}

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  if (typeof d.token === "string" && d.token) return d.token;
  if (typeof d.accessToken === "string" && d.accessToken) return d.accessToken;
  if (typeof d.access_token === "string" && d.access_token) return d.access_token;

  const inner = d.data;
  if (inner && typeof inner === "object") {
    const o = inner as Record<string, unknown>;
    if (typeof o.token === "string" && o.token) return o.token;
    if (typeof o.accessToken === "string" && o.accessToken) return o.accessToken;
    if (typeof o.access_token === "string" && o.access_token) return o.access_token;
  }

  const result = d.result;
  if (result && typeof result === "object") {
    const o = result as Record<string, unknown>;
    if (typeof o.token === "string" && o.token) return o.token;
    if (typeof o.accessToken === "string" && o.accessToken) return o.accessToken;
  }

  return null;
}

export function extractErrorMessage(
  data: unknown,
  status: number,
  fallback: string,
): string {
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.message === "string" && d.message) return d.message;
    if (typeof d.error === "string" && d.error) return d.error;
    const msg = d.msg;
    if (typeof msg === "string" && msg) return msg;
    if (Array.isArray(d.errors) && d.errors.length > 0) {
      const first = d.errors[0];
      if (typeof first === "string") return first;
    }
  }
  if (status === 401 || status === 403) {
    return "You don’t have permission to perform this action.";
  }
  return fallback;
}

async function postJson<TBody extends Record<string, unknown>>(
  path: string,
  body: TBody,
): Promise<AdminSimpleResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(path), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
      message: extractErrorMessage(data, res.status, "Request failed. Try again."),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

/**
 * POST { email, password } to backend admin login.
 */
export async function postAdminLogin(
  body: AdminLoginRequest,
): Promise<AdminLoginResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_LOGIN_PATH), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
        "Login failed. Please try again.",
      ),
      status: res.status,
    };
  }

  return {
    ok: true,
    token: extractToken(data),
    raw: data,
  };
}

/** POST { email } — triggers reset email flow. */
export async function postAdminForgotPassword(
  body: AdminForgotPasswordRequest,
): Promise<AdminSimpleResult> {
  return postJson(ADMIN_FORGOT_PASSWORD_PATH, {
    email: body.email.trim(),
  });
}

/**
 * POST { token, password } — completes password reset.
 * If your API uses different keys (e.g. resetToken, newPassword), adjust the body here.
 */
export async function postAdminResetPassword(
  body: AdminResetPasswordRequest,
): Promise<AdminSimpleResult> {
  return postJson(ADMIN_RESET_PASSWORD_PATH, {
    token: body.token,
    password: body.password,
  });
}

/**
 * POST while signed in (Bearer). Body keys follow common REST style; adjust if
 * your API uses e.g. oldPassword / password.
 */
export async function postAdminChangePassword(
  accessToken: string,
  body: AdminChangePasswordRequest,
): Promise<AdminSimpleResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_CHANGE_PASSWORD_PATH), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
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
        "Could not update password. Try again.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}
