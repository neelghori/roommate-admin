import { extractErrorMessage } from "@/lib/api/admin-auth";
import { getPublicApiBaseUrl } from "@/lib/env";

/**
 * FAQ REST base path (GET/POST `/api/v1/faqs`, PATCH/DELETE `/api/v1/faqs/:id`).
 */
export const FAQS_API_PATH = "/api/v1/faqs";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqBody = {
  question: string;
  answer: string;
};

function buildUrl(path: string): string {
  return `${getPublicApiBaseUrl()}${path}`;
}

function faqItemUrl(id: string): string {
  return `${FAQS_API_PATH}/${encodeURIComponent(id)}`;
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

export function mapFaqFromApi(raw: unknown): FaqItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const idRaw = o.id ?? o._id;
  const id = idRaw != null ? String(idRaw) : null;
  const question =
    pickString(o, ["question", "title", "q"]) ?? "";
  const answer =
    pickString(o, ["answer", "content", "body", "description", "a"]) ?? "";
  if (!id || !question.trim() || !answer.trim()) return null;
  return { id, question: question.trim(), answer: answer.trim() };
}

function extractFaqsArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  for (const key of ["data", "faqs", "items", "results"]) {
    const v = d[key];
    if (Array.isArray(v)) return v;
  }
  const inner = d.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const o = inner as Record<string, unknown>;
    for (const key of ["faqs", "items", "results"]) {
      const v = o[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export type FetchFaqsSuccess = { ok: true; items: FaqItem[] };
export type FetchFaqsFailure = {
  ok: false;
  message: string;
  status: number;
};
export type FetchFaqsResult = FetchFaqsSuccess | FetchFaqsFailure;

export async function fetchFaqs(
  accessToken: string,
): Promise<FetchFaqsResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(FAQS_API_PATH), {
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
        "Could not load FAQs.",
      ),
      status: res.status,
    };
  }

  const items = extractFaqsArray(body)
    .map(mapFaqFromApi)
    .filter((x): x is FaqItem => x !== null);

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

export async function createFaq(
  accessToken: string,
  body: FaqBody,
): Promise<MutationResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(FAQS_API_PATH), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        question: body.question.trim(),
        answer: body.answer.trim(),
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
        "Could not create FAQ.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

export async function updateFaq(
  accessToken: string,
  id: string,
  body: FaqBody,
): Promise<MutationResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(faqItemUrl(id)), {
      method: "PATCH",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        question: body.question.trim(),
        answer: body.answer.trim(),
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
        "Could not update FAQ.",
      ),
      status: res.status,
    };
  }

  return { ok: true, raw: data };
}

export async function deleteFaq(
  accessToken: string,
  id: string,
): Promise<MutationResult> {
  let res: Response;
  try {
    res = await fetch(buildUrl(faqItemUrl(id)), {
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
      "Could not delete FAQ.",
    ),
    status: res.status,
  };
}
