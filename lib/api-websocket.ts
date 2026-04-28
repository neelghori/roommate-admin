import { getPublicApiBaseUrl } from "@/lib/env";

/**
 * Build a WebSocket URL on the same host as the REST API (e.g. http://localhost:5000 → ws://localhost:5000).
 */
export function buildApiWebSocketUrl(pathWithQuery: string): string {
  const raw = getPublicApiBaseUrl().replace(/\/$/, "");
  let u: URL;
  try {
    u = new URL(raw.startsWith("http") ? raw : `http://${raw}`);
  } catch {
    const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
    return `ws://localhost:5000${path}`;
  }
  const scheme = u.protocol === "https:" ? "wss:" : "ws:";
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  return `${scheme}//${u.host}${path}`;
}
