import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";

export const ADMIN_PROPERTIES_PATH = "/api/v1/admin/properties";

export type AdminPropertyStatusTab =
  | "queue"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "all";

export type AdminPropertyRow = {
  id: string;
  title: string;
  ownerName: string;
  ownerEmail: string;
  type: string;
  listingType: string;
  city: string;
  price: number;
  status: string;
  moderationStatus?: string;
  isPublished?: boolean;
  rejectionReason: string;
  createdAt: string;
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

function pickNumber(o: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return 0;
}

function mapRow(raw: unknown): AdminPropertyRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickString(o, ["id", "_id"]);
  if (!id) return null;
  const title = pickString(o, ["title"]) ?? "Untitled";
  return {
    id,
    title,
    ownerName: pickString(o, ["ownerName"]) ?? "—",
    ownerEmail: pickString(o, ["ownerEmail"]) ?? "—",
    type: pickString(o, ["type"]) ?? "—",
    listingType: pickString(o, ["listingType"]) ?? "",
    city: pickString(o, ["city"]) ?? "—",
    price: pickNumber(o, ["price"]),
    status: pickString(o, ["status"]) ?? "PENDING",
    moderationStatus: pickString(o, ["moderationStatus"]) ?? undefined,
    isPublished: typeof o.isPublished === "boolean" ? o.isPublished : undefined,
    rejectionReason: pickString(o, ["rejectionReason"]) ?? "",
    createdAt: pickString(o, ["createdAt"]) ?? "",
  };
}

function extractItems(body: unknown): unknown[] {
  if (!body || typeof body !== "object") return [];
  const root = body as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object") {
    const items = (inner as Record<string, unknown>).items;
    if (Array.isArray(items)) return items;
  }
  if (Array.isArray(root.items)) return root.items;
  return [];
}

export type FetchAdminPropertiesSuccess = { ok: true; items: AdminPropertyRow[] };
export type FetchAdminPropertiesFailure = {
  ok: false;
  message: string;
  status: number;
};
export type FetchAdminPropertiesResult =
  | FetchAdminPropertiesSuccess
  | FetchAdminPropertiesFailure;

export async function fetchAdminProperties(
  accessToken: string,
  options?: { status?: AdminPropertyStatusTab },
): Promise<FetchAdminPropertiesResult> {
  const status = options?.status;
  const qs =
    status && status !== "all"
      ? `?status=${encodeURIComponent(status)}`
      : "";
  let res: Response;
  try {
    res = await fetch(buildUrl(`${ADMIN_PROPERTIES_PATH}${qs}`), {
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
        "Could not load properties.",
      ),
      status: res.status,
    };
  }

  const items = extractItems(body)
    .map(mapRow)
    .filter((x): x is AdminPropertyRow => x !== null);

  return { ok: true, items };
}

type MutationFailure = { ok: false; message: string; status: number };
type MutationOk<T = unknown> = { ok: true; raw: T };
export type ModeratePropertyResult = MutationOk | MutationFailure;

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function moderateAdminProperty(
  accessToken: string,
  propertyId: string,
  body: { action: "approve" | "reject" | "under_review"; reason?: string },
): Promise<ModeratePropertyResult> {
  const url = buildUrl(
    `${ADMIN_PROPERTIES_PATH}/${encodeURIComponent(propertyId)}/moderate`,
  );
  let res: Response;
  try {
    res = await fetch(url, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(
        body.action === "reject"
          ? { action: body.action, reason: (body.reason ?? "").trim() }
          : { action: body.action },
      ),
    });
  } catch {
    return {
      ok: false,
      message: "Cannot reach server. Is the API running?",
      status: 0,
    };
  }

  const data = await parseJsonResponse(res);

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(
        data,
        res.status,
        "Could not update listing.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

export type FetchAdminPropertyDetailSuccess = {
  ok: true;
  property: Record<string, unknown>;
  summary: AdminPropertyRow;
};

export type FetchAdminPropertyDetailFailure = {
  ok: false;
  message: string;
  status: number;
};

export type FetchAdminPropertyDetailResult =
  | FetchAdminPropertyDetailSuccess
  | FetchAdminPropertyDetailFailure;

function extractPropertyDetail(body: unknown): {
  property: Record<string, unknown> | null;
  summary: AdminPropertyRow | null;
} {
  if (!body || typeof body !== "object") {
    return { property: null, summary: null };
  }
  const root = body as Record<string, unknown>;
  const data = root.data;
  if (!data || typeof data !== "object") {
    return { property: null, summary: null };
  }
  const inner = data as Record<string, unknown>;
  const rawProp = inner.property;
  const property =
    rawProp && typeof rawProp === "object"
      ? (rawProp as Record<string, unknown>)
      : null;
  const summary = mapRow(inner.summary);
  return { property, summary };
}

export async function fetchAdminPropertyById(
  accessToken: string,
  propertyId: string,
): Promise<FetchAdminPropertyDetailResult> {
  const url = buildUrl(
    `${ADMIN_PROPERTIES_PATH}/${encodeURIComponent(propertyId)}`,
  );
  let res: Response;
  try {
    res = await fetch(url, {
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

  const body = await parseJsonResponse(res);

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(
        body,
        res.status,
        "Could not load property.",
      ),
      status: res.status,
    };
  }

  const { property, summary } = extractPropertyDetail(body);
  if (!property || !summary) {
    return {
      ok: false,
      message: "Invalid response from server.",
      status: 502,
    };
  }

  return { ok: true, property, summary };
}
