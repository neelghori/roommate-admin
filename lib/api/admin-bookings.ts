import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";

export const ADMIN_BOOKINGS_PATH = "/api/v1/admin/bookings";

export type AdminBookingRequester = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
};

export type AdminBookingPropertyOwner = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
};

export type AdminBookingProperty = {
  id: string;
  title: string;
  listingType: string;
  imageUrl: string | null;
  locationLabel: string;
  rentMin: number | null;
  moderationStatus: string | null;
  isPublished: boolean | null;
  owner: AdminBookingPropertyOwner | null;
};

export type AdminVisitBookingRow = {
  id: string;
  status: string;
  preferredDate: string;
  preferredTimeStart: string | null;
  preferredTimeEnd: string | null;
  contactName: string;
  contactPhone: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  requester: AdminBookingRequester | null;
  property: AdminBookingProperty | null;
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

function mapRequester(raw: unknown): AdminBookingRequester | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickString(o, ["id", "_id"]);
  if (!id) return null;
  return {
    id,
    fullName: pickString(o, ["fullName", "name"]) ?? "—",
    email: pickString(o, ["email"]) ?? "",
    mobile: pickString(o, ["mobile", "phone"]) ?? "",
    role: pickString(o, ["role"]) ?? "",
  };
}

function mapOwner(raw: unknown): AdminBookingPropertyOwner | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickString(o, ["id", "_id"]);
  if (!id) return null;
  return {
    id,
    fullName: pickString(o, ["fullName", "name"]) ?? "—",
    email: pickString(o, ["email"]) ?? "",
    mobile: pickString(o, ["mobile", "phone"]) ?? "",
  };
}

function mapProperty(raw: unknown): AdminBookingProperty | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickString(o, ["id", "_id"]);
  if (!id) return null;
  const rentRaw = o.rentRange;
  let rentMin: number | null = null;
  if (rentRaw && typeof rentRaw === "object") {
    const m = (rentRaw as Record<string, unknown>).min;
    if (typeof m === "number" && !Number.isNaN(m)) rentMin = m;
  }
  const isPublished =
    typeof o.isPublished === "boolean" ? o.isPublished : null;
  const imageRaw = o.imageUrl;
  const imageUrl =
    typeof imageRaw === "string" && imageRaw.trim() ? imageRaw.trim() : null;

  return {
    id,
    title: pickString(o, ["title"]) ?? "Untitled",
    listingType: pickString(o, ["listingType"]) ?? "",
    imageUrl,
    locationLabel: pickString(o, ["locationLabel"]) ?? "",
    rentMin,
    moderationStatus: pickString(o, ["moderationStatus"]),
    isPublished,
    owner: mapOwner(o.owner),
  };
}

function mapRow(raw: unknown): AdminVisitBookingRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = pickString(o, ["id", "_id"]);
  if (!id) return null;
  return {
    id,
    status: pickString(o, ["status"]) ?? "pending",
    preferredDate: pickString(o, ["preferredDate"]) ?? "",
    preferredTimeStart: pickString(o, ["preferredTimeStart"]),
    preferredTimeEnd: pickString(o, ["preferredTimeEnd"]),
    contactName: pickString(o, ["contactName"]) ?? "",
    contactPhone: pickString(o, ["contactPhone"]) ?? "",
    notes: pickString(o, ["notes"]),
    createdAt: pickString(o, ["createdAt"]) ?? "",
    updatedAt: pickString(o, ["updatedAt"]) ?? "",
    requester: mapRequester(o.requester),
    property: mapProperty(o.property),
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

export type FetchAdminBookingsSuccess = { ok: true; items: AdminVisitBookingRow[] };
export type FetchAdminBookingsFailure = {
  ok: false;
  message: string;
  status: number;
};
export type FetchAdminBookingsResult =
  | FetchAdminBookingsSuccess
  | FetchAdminBookingsFailure;

export async function fetchAdminVisitBookings(
  accessToken: string,
): Promise<FetchAdminBookingsResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(ADMIN_BOOKINGS_PATH), {
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
        "Could not load bookings.",
      ),
      status: res.status,
    };
  }

  const items = extractItems(body)
    .map(mapRow)
    .filter((x): x is AdminVisitBookingRow => x !== null);

  return { ok: true, items };
}
