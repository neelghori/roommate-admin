import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";
import type { AmenityIconKey } from "@/lib/amenities/amenity-icon";
import { isAmenityIconKey } from "@/lib/amenities/amenity-icon";

/**
 * Amenities REST base path (GET/POST `/api/v1/amenities`, PATCH/DELETE `/api/v1/amenities/:id`).
 */
export const AMENITIES_API_PATH = "/api/v1/amenities";

export type AmenityItem = {
  id: string;
  name: string;
  iconKey: AmenityIconKey;
};

export type AmenityBody = {
  name: string;
  iconKey: AmenityIconKey;
};

function buildUrl(path: string): string {
  return `${getPublicApiBaseUrl()}${path}`;
}

function amenityItemUrl(id: string): string {
  return `${AMENITIES_API_PATH}/${encodeURIComponent(id)}`;
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

function pickIconKey(o: Record<string, unknown>): AmenityIconKey | null {
  const raw = pickString(o, ["iconKey", "icon", "slug", "key"]);
  if (raw && isAmenityIconKey(raw)) return raw;
  return null;
}

export function mapAmenityFromApi(raw: unknown): AmenityItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const idRaw = o.id ?? o._id;
  const id = idRaw != null ? String(idRaw) : null;
  const name = pickString(o, ["name", "title", "label"]) ?? "";
  const iconKey = pickIconKey(o);
  if (!id || !name.trim() || !iconKey) return null;
  return { id, name: name.trim(), iconKey };
}

function extractAmenitiesArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  for (const key of ["data", "amenities", "items", "results"]) {
    const v = d[key];
    if (Array.isArray(v)) return v;
  }
  const inner = d.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const o = inner as Record<string, unknown>;
    for (const key of ["amenities", "items", "results"]) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export type FetchAmenitiesSuccess = { ok: true; items: AmenityItem[] };
export type FetchAmenitiesFailure = {
  ok: false;
  message: string;
  status: number;
};
export type FetchAmenitiesResult = FetchAmenitiesSuccess | FetchAmenitiesFailure;

export async function fetchAmenities(
  accessToken: string,
): Promise<FetchAmenitiesResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(AMENITIES_API_PATH), {
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
        "Could not load amenities.",
      ),
      status: res.status,
    };
  }

  const items = extractAmenitiesArray(body)
    .map(mapAmenityFromApi)
    .filter((x): x is AmenityItem => x !== null);

  return { ok: true, items };
}

type MutationFailure = { ok: false; message: string; status: number };
type MutationOk<T = unknown> = { ok: true; raw: T };
type MutationResult<T = unknown> = MutationOk<T> | MutationFailure;

async function parseJsonResponse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export async function createAmenity(
  accessToken: string,
  body: AmenityBody,
): Promise<MutationResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(AMENITIES_API_PATH), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: body.name.trim(),
        iconKey: body.iconKey,
      }),
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
        "Could not create amenity.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

export async function updateAmenity(
  accessToken: string,
  id: string,
  body: AmenityBody,
): Promise<MutationResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(amenityItemUrl(id)), {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: body.name.trim(),
        iconKey: body.iconKey,
      }),
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
        "Could not update amenity.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

export async function deleteAmenity(
  accessToken: string,
  id: string,
): Promise<MutationResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(amenityItemUrl(id)), {
      method: "DELETE",
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

  if (res.status === 204 || res.status === 200) {
    return { ok: true, raw: null };
  }

  const data = await parseJsonResponse(res);
  return {
    ok: false,
    message: extractErrorMessage(
      data,
      res.status,
      "Could not delete amenity.",
    ),
    status: res.status,
  };
}
