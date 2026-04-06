import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";

/** PATCH current admin session profile (same rules as backend `me` resource). */
export const ADMIN_AUTH_ME_PATH = "/api/v1/admin/auth/me";

export type AdminProfileUpdateRequest = {
  fullName: string;
};

function buildUrl(path: string): string {
  return `${getPublicApiBaseUrl()}${path}`;
}

export type PatchAdminProfileSuccess = { ok: true; raw: unknown };
export type PatchAdminProfileFailure = {
  ok: false;
  message: string;
  status: number;
};
export type PatchAdminProfileResult =
  | PatchAdminProfileSuccess
  | PatchAdminProfileFailure;

/**
 * PATCH /api/v1/admin/auth/me while signed in (Bearer).
 * Adjust body keys if your API expects different field names.
 */
export async function patchAdminProfile(
  accessToken: string,
  body: AdminProfileUpdateRequest,
): Promise<PatchAdminProfileResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_AUTH_ME_PATH), {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        fullName: body.fullName.trim(),
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
        "Could not update profile. Try again.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}
