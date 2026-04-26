import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";

export const ADMIN_DASHBOARD_OVERVIEW_PATH = "/api/v1/admin/dashboard/overview";

export type AdminDashboardMonthPoint = {
  monthKey: string;
  label: string;
  count: number;
};

export type AdminDashboardOverview = {
  totalProperties: number;
  totalUsers: number;
  totalBookings: number;
  totalFaqs: number;
  totalAmenities: number;
  propertiesAddedMonthly: AdminDashboardMonthPoint[];
};

export type FetchAdminDashboardSuccess = { ok: true; overview: AdminDashboardOverview };
export type FetchAdminDashboardFailure = {
  ok: false;
  message: string;
  status: number;
};

export type FetchAdminDashboardResult =
  | FetchAdminDashboardSuccess
  | FetchAdminDashboardFailure;

function buildUrl(path: string): string {
  return `${getPublicApiBaseUrl()}${path}`;
}

function pickNumber(o: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return 0;
}

function mapMonthly(raw: unknown): AdminDashboardMonthPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: AdminDashboardMonthPoint[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const monthKey = typeof o.monthKey === "string" ? o.monthKey : "";
    const label = typeof o.label === "string" ? o.label : monthKey;
    const count = typeof o.count === "number" && !Number.isNaN(o.count) ? o.count : 0;
    if (monthKey) out.push({ monthKey, label, count });
  }
  return out;
}

function parseOverview(body: unknown): AdminDashboardOverview | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  return {
    totalProperties: pickNumber(d, ["totalProperties"]),
    totalUsers: pickNumber(d, ["totalUsers"]),
    totalBookings: pickNumber(d, ["totalBookings"]),
    totalFaqs: pickNumber(d, ["totalFaqs"]),
    totalAmenities: pickNumber(d, ["totalAmenities"]),
    propertiesAddedMonthly: mapMonthly(d.propertiesAddedMonthly),
  };
}

/**
 * GET /api/v1/admin/dashboard/overview — aggregate counts and monthly new properties (Bearer).
 */
export async function fetchAdminDashboardOverview(
  accessToken: string,
): Promise<FetchAdminDashboardResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_DASHBOARD_OVERVIEW_PATH), {
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
        "Could not load dashboard.",
      ),
      status: res.status,
    };
  }

  const overview = parseOverview(body);
  if (!overview) {
    return {
      ok: false,
      message: "Invalid dashboard response from server.",
      status: res.status,
    };
  }

  return { ok: true, overview };
}
