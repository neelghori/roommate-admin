/**
 * Prevents open redirects — only same-app relative paths are allowed.
 */
export function getSafeInternalPath(next: string | null): string | null {
  if (!next || typeof next !== "string") return null;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  if (trimmed.includes("://")) return null;
  return trimmed;
}
